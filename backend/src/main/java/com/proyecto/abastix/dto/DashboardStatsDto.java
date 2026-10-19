package com.proyecto.abastix.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsDto(
        long activeProducts,
        long lowStockProducts,
        long todayOrdersCount,
        BigDecimal todaySalesTotal,
        long totalCustomers,
        List<OrderDto> recentOrders,
        List<SalesChartPointDto> salesChart,
        List<OrderStatusPointDto> ordersByStatus) {
}
