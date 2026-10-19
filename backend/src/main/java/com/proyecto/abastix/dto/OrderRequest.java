package com.proyecto.abastix.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record OrderRequest(
        @NotNull(message = "El cliente es obligatorio")
        Integer customerId,

        @NotBlank(message = "El método de pago es obligatorio")
        String paymentMethod,

        @NotEmpty(message = "Debe incluir al menos un producto en el pedido")
        List<@Valid OrderItemRequest> items) {
}
