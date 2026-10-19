package com.proyecto.abastix.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.OrderDetailDto;
import com.proyecto.abastix.dto.OrderDto;
import com.proyecto.abastix.dto.OrderItemRequest;
import com.proyecto.abastix.dto.OrderRequest;
import com.proyecto.abastix.dto.OrderStatusRequest;
import com.proyecto.abastix.entity.Customer;
import com.proyecto.abastix.entity.Order;
import com.proyecto.abastix.entity.OrderDetail;
import com.proyecto.abastix.entity.Product;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.rabbit.LowStockEvent;
import com.proyecto.abastix.rabbit.OrderEvent;
import com.proyecto.abastix.rabbit.RabbitMQProducer;
import com.proyecto.abastix.repository.CustomerRepository;
import com.proyecto.abastix.repository.OrderDetailRepository;
import com.proyecto.abastix.repository.OrderRepository;
import com.proyecto.abastix.repository.ProductRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final InventoryMovementService inventoryMovementService;
    private final NotificationService notificationService;
    private final RabbitMQProducer rabbitProducer;

    public OrderService(
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository,
            InventoryMovementService inventoryMovementService,
            NotificationService notificationService,
            RabbitMQProducer rabbitProducer) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.inventoryMovementService = inventoryMovementService;
        this.notificationService = notificationService;
        this.rabbitProducer = rabbitProducer;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listar(String status, Integer customerId) {
        List<Order> list;
        if (customerId != null) {
            list = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        } else if (status != null && !status.isBlank()) {
            list = orderRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else {
            list = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto obtener(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        return toDto(order);
    }

    @Transactional
    public OrderDto crear(OrderRequest request, String userEmail) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (Boolean.FALSE.equals(customer.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cliente se encuentra inactivo");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setUser(user);
        order.setPaymentMethod(request.paymentMethod());
        order.setStatus("CONFIRMADO"); // Confirmado para despacho inmediato
        order.setCreatedAt(LocalDateTime.now());
        order.setTotal(BigDecimal.ZERO);

        Order savedOrder = orderRepository.save(order);

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<OrderDetail> detailList = new ArrayList<>();
        List<Product> productsToAlert = new ArrayList<>();

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Producto ID " + itemReq.productId() + " no encontrado"));

            if (Boolean.FALSE.equals(product.getActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El producto '" + product.getName() + "' se encuentra inactivo");
            }

            int requestedQty = itemReq.quantity();
            if (product.getStock() < requestedQty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Stock insuficiente para '" + product.getName() + "'. Solicitado: " +
                                requestedQty + ", Disponible: " + product.getStock());
            }

            // Descontar inventario en el servidor
            product.setStock(product.getStock() - requestedQty);
            productRepository.save(product);

            // Registrar movimiento de stock
            inventoryMovementService.registrarMovimientoInterno(
                    product,
                    "SALIDA",
                    requestedQty,
                    "Venta - Pedido #" + savedOrder.getId(),
                    savedOrder,
                    user);

            // Verificar si entra en bajo stock
            if (product.getStock() <= product.getMinStock()) {
                productsToAlert.add(product);
            }

            // Cálculo seguro de importes con precio del servidor
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestedQty));
            calculatedTotal = calculatedTotal.add(subtotal);

            OrderDetail detail = new OrderDetail(null, savedOrder, product, requestedQty, unitPrice, subtotal);
            detailList.add(orderDetailRepository.save(detail));
        }

        savedOrder.setTotal(calculatedTotal);
        savedOrder.setDetails(detailList);
        orderRepository.save(savedOrder);

        // Notificaciones y eventos asíncronos en RabbitMQ
        OrderEvent orderEvent = new OrderEvent(
                "ORDER_CONFIRMED",
                savedOrder.getId(),
                calculatedTotal,
                customer.getFullName(),
                user.getId(),
                LocalDateTime.now());
        rabbitProducer.publishOrderConfirmed(orderEvent);
        notificationService.crearNotificacion(
                "ORDER_CONFIRMED",
                "Nuevo pedido #" + savedOrder.getId() + " registrado por S/ " + calculatedTotal + " (" + customer.getFullName() + ")",
                user.getId());

        for (Product p : productsToAlert) {
            LowStockEvent lowStockEvent = new LowStockEvent(
                    "LOW_STOCK",
                    p.getId(),
                    p.getName(),
                    p.getSku(),
                    p.getStock(),
                    p.getMinStock(),
                    LocalDateTime.now());
            rabbitProducer.publishLowStock(lowStockEvent);
            notificationService.crearNotificacion(
                    "LOW_STOCK",
                    "Stock bajo: " + p.getName() + " (" + p.getSku() + ") tiene " + p.getStock() + " uds restantes.",
                    user.getId());
        }

        return toDto(savedOrder);
    }

    @Transactional
    public OrderDto actualizarEstado(Integer id, OrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        String newStatus = request.status().trim().toUpperCase();
        String oldStatus = order.getStatus();

        // Si se cancela un pedido confirmado, reponer el stock
        if ("CANCELADO".equals(newStatus) && !"CANCELADO".equals(oldStatus)) {
            List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getId());
            for (OrderDetail d : details) {
                Product p = d.getProduct();
                p.setStock(p.getStock() + d.getQuantity());
                productRepository.save(p);

                inventoryMovementService.registrarMovimientoInterno(
                        p,
                        "ENTRADA",
                        d.getQuantity(),
                        "Cancelación - Reingreso Pedido #" + order.getId(),
                        order,
                        order.getUser());
            }
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    private OrderDto toDto(Order o) {
        List<OrderDetail> details = o.getDetails() != null && !o.getDetails().isEmpty()
                ? o.getDetails()
                : orderDetailRepository.findByOrderId(o.getId());

        List<OrderDetailDto> detailDtos = details.stream().map(d -> new OrderDetailDto(
                d.getId(),
                d.getProduct() != null ? d.getProduct().getId() : null,
                d.getProduct() != null ? d.getProduct().getName() : null,
                d.getProduct() != null ? d.getProduct().getSku() : null,
                d.getQuantity(),
                d.getUnitPrice(),
                d.getSubtotal())).toList();

        return new OrderDto(
                o.getId(),
                o.getCustomer() != null ? o.getCustomer().getId() : null,
                o.getCustomer() != null ? o.getCustomer().getFullName() : null,
                o.getCustomer() != null ? o.getCustomer().getDocument() : null,
                o.getUser() != null ? o.getUser().getId() : null,
                o.getUser() != null ? o.getUser().getFullName() : null,
                o.getStatus(),
                o.getPaymentMethod(),
                o.getTotal(),
                o.getCreatedAt(),
                detailDtos);
    }
}
