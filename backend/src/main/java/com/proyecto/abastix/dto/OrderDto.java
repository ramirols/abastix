package com.proyecto.abastix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Integer id,
        Integer customerId,
        String customerName,
        String customerDocument,
        Integer userId,
        String userName,
        String status,
        String paymentMethod,
        BigDecimal total,
        LocalDateTime createdAt,
        List<OrderDetailDto> details) {
}
