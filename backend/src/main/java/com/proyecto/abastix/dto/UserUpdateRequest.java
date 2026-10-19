package com.proyecto.abastix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(max = 150, message = "Máximo 150 caracteres")
        String fullName,

        @NotBlank(message = "El rol es obligatorio")
        String role,

        @Size(min = 6, message = "Si actualiza la contraseña, debe tener al menos 6 caracteres")
        String password) {
}
