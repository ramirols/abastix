package com.proyecto.abastix.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.abastix.dto.UserCreateRequest;
import com.proyecto.abastix.dto.UserDto;
import com.proyecto.abastix.dto.UserUpdateRequest;
import com.proyecto.abastix.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> listar() {
        return ResponseEntity.ok(userService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> crear(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.actualizar(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserDto> desactivar(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.desactivar(id));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserDto> activar(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.activar(id));
    }
}
