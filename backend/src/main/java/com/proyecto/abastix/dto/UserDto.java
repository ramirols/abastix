package com.proyecto.abastix.dto;

public record UserDto(
        Integer id,
        String fullName,
        String email,
        String role,
        Boolean active) {
}
