package com.proyecto.abastix.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventoryMovementRequest(
        @NotNull(message = "El producto es obligatorio")
        Integer productId,

        @NotBlank(message = "El tipo de movimiento es obligatorio (ENTRADA, SALIDA, AJUSTE)")
        String type,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer quantity,

        @NotBlank(message = "El motivo es obligatorio")
        String reason) {
}
