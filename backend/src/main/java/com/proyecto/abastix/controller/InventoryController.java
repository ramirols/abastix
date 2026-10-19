package com.proyecto.abastix.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.abastix.dto.InventoryMovementDto;
import com.proyecto.abastix.dto.InventoryMovementRequest;
import com.proyecto.abastix.service.InventoryMovementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/inventory/movements")
public class InventoryController {

    private final InventoryMovementService movementService;

    public InventoryController(InventoryMovementService movementService) {
        this.movementService = movementService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<List<InventoryMovementDto>> listar(@RequestParam(required = false) Integer productId) {
        return ResponseEntity.ok(movementService.listar(productId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InventoryMovementDto> registrar(
            @Valid @RequestBody InventoryMovementRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movementService.registrar(request, principal.getName()));
    }
}
