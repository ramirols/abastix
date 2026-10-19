package com.proyecto.abastix.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.abastix.dto.DashboardStatsDto;
import com.proyecto.abastix.dto.OrderDto;
import com.proyecto.abastix.dto.OrderStatusPointDto;
import com.proyecto.abastix.dto.SalesChartPointDto;
import com.proyecto.abastix.entity.Order;
import com.proyecto.abastix.entity.Product;
import com.proyecto.abastix.repository.CustomerRepository;
import com.proyecto.abastix.repository.OrderRepository;
import com.proyecto.abastix.repository.ProductRepository;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderService orderService;

    public DashboardService(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            OrderService orderService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto obtenerEstadisticas() {
        List<Product> allProducts = productRepository.findAll();
        long activeProducts = allProducts.stream().filter(p -> Boolean.TRUE.equals(p.getActive())).count();
        long lowStockProducts = allProducts.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()) && p.getStock() <= p.getMinStock())
                .count();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Order> todayOrders = orderRepository.findOrdersOfDay(startOfDay, endOfDay);
        long todayOrdersCount = todayOrders.size();
        BigDecimal todaySalesTotal = todayOrders.stream()
                .filter(o -> !"CANCELADO".equals(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalCustomers = customerRepository.count();

        List<OrderDto> allOrders = orderService.listar(null, null);
        List<OrderDto> recentOrders = allOrders.stream().limit(6).toList();

        // Gráfico de ventas últimos 7 días
        List<SalesChartPointDto> salesChart = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime s = d.atStartOfDay();
            LocalDateTime e = d.atTime(LocalTime.MAX);
            List<Order> dayOrders = orderRepository.findOrdersOfDay(s, e);

            BigDecimal dayTotal = dayOrders.stream()
                    .filter(o -> !"CANCELADO".equals(o.getStatus()))
                    .map(Order::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            salesChart.add(new SalesChartPointDto(d.format(formatter), dayTotal, dayOrders.size()));
        }

        // Distribución por estado
        Map<String, Long> statusMap = new HashMap<>();
        String[] statuses = {"CONFIRMADO", "PREPARANDO", "LISTO", "ENTREGADO", "PENDIENTE", "CANCELADO"};
        for (String st : statuses) {
            statusMap.put(st, 0L);
        }
        for (OrderDto o : allOrders) {
            statusMap.put(o.status(), statusMap.getOrDefault(o.status(), 0L) + 1);
        }

        List<OrderStatusPointDto> ordersByStatus = new ArrayList<>();
        for (String st : statuses) {
            ordersByStatus.add(new OrderStatusPointDto(st, statusMap.get(st)));
        }

        return new DashboardStatsDto(
                activeProducts,
                lowStockProducts,
                todayOrdersCount,
                todaySalesTotal,
                totalCustomers,
                recentOrders,
                salesChart,
                ordersByStatus);
    }
}
