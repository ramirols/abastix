package com.proyecto.abastix.dto;

import java.time.LocalDateTime;

public record InventoryMovementDto(
        Integer id,
        Integer productId,
        String productName,
        String productSku,
        String type,
        Integer quantity,
        String reason,
        Integer orderId,
        Integer userId,
        String userName,
        LocalDateTime createdAt) {
}
