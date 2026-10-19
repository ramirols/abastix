package com.proyecto.abastix.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.InventoryMovementDto;
import com.proyecto.abastix.dto.InventoryMovementRequest;
import com.proyecto.abastix.entity.InventoryMovement;
import com.proyecto.abastix.entity.Order;
import com.proyecto.abastix.entity.Product;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.rabbit.LowStockEvent;
import com.proyecto.abastix.rabbit.RabbitMQProducer;
import com.proyecto.abastix.repository.InventoryMovementRepository;
import com.proyecto.abastix.repository.ProductRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RabbitMQProducer rabbitProducer;
    private final NotificationService notificationService;

    public InventoryMovementService(
            InventoryMovementRepository movementRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            RabbitMQProducer rabbitProducer,
            NotificationService notificationService) {
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.rabbitProducer = rabbitProducer;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementDto> listar(Integer productId) {
        List<InventoryMovement> list = (productId != null)
                ? movementRepository.findByProductIdOrderByCreatedAtDesc(productId)
                : movementRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(this::toDto).toList();
    }

    @Transactional
    public InventoryMovementDto registrar(InventoryMovementRequest request, String userEmail) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        String type = request.type().trim().toUpperCase();
        int qty = request.quantity();

        if ("SALIDA".equals(type)) {
            if (product.getStock() < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente. Disponible: " + product.getStock());
            }
            product.setStock(product.getStock() - qty);
        } else if ("ENTRADA".equals(type)) {
            product.setStock(product.getStock() + qty);
        } else if ("AJUSTE".equals(type)) {
            product.setStock(qty);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de movimiento inválido (use ENTRADA, SALIDA o AJUSTE)");
        }

        productRepository.save(product);

        InventoryMovement movement = new InventoryMovement(
                null,
                product,
                type,
                qty,
                request.reason().trim(),
                null,
                user,
                LocalDateTime.now());

        InventoryMovement saved = movementRepository.save(movement);

        // Si el stock cae al nivel mínimo o menor, emitir alerta LOW_STOCK
        if (product.getStock() <= product.getMinStock()) {
            LowStockEvent lowStockEvent = new LowStockEvent(
                    "LOW_STOCK",
                    product.getId(),
                    product.getName(),
                    product.getSku(),
                    product.getStock(),
                    product.getMinStock(),
                    LocalDateTime.now());
            rabbitProducer.publishLowStock(lowStockEvent);
            notificationService.crearNotificacion(
                    "LOW_STOCK",
                    "Alerta: Stock bajo en " + product.getName() + " (" + product.getSku() + "). Quedan " + product.getStock() + " unidades.",
                    user.getId());
        }

        return toDto(saved);
    }

    @Transactional
    public void registrarMovimientoInterno(Product product, String type, int qty, String reason, Order order, User user) {
        InventoryMovement movement = new InventoryMovement(
                null,
                product,
                type,
                qty,
                reason,
                order,
                user,
                LocalDateTime.now());
        movementRepository.save(movement);
    }

    private InventoryMovementDto toDto(InventoryMovement m) {
        return new InventoryMovementDto(
                m.getId(),
                m.getProduct() != null ? m.getProduct().getId() : null,
                m.getProduct() != null ? m.getProduct().getName() : null,
                m.getProduct() != null ? m.getProduct().getSku() : null,
                m.getType(),
                m.getQuantity(),
                m.getReason(),
                m.getOrder() != null ? m.getOrder().getId() : null,
                m.getUser() != null ? m.getUser().getId() : null,
                m.getUser() != null ? m.getUser().getFullName() : null,
                m.getCreatedAt());
    }
}
