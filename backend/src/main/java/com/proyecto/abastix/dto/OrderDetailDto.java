package com.proyecto.abastix.dto;

import java.math.BigDecimal;

public record OrderDetailDto(
        Integer id,
        Integer productId,
        String productName,
        String productSku,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal) {
}
