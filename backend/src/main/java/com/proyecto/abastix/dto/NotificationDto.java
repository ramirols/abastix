package com.proyecto.abastix.dto;

import java.time.LocalDateTime;

public record NotificationDto(
        Integer id,
        Integer userId,
        String type,
        String message,
        Boolean read,
        LocalDateTime createdAt) {
}
