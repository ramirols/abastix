package com.proyecto.abastix.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderStatusRequest(
        @NotBlank(message = "El estado es obligatorio")
        String status) {
}
