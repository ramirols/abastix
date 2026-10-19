package com.proyecto.abastix.controller;

import java.security.Principal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.abastix.dto.OrderDto;
import com.proyecto.abastix.dto.OrderRequest;
import com.proyecto.abastix.dto.OrderStatusRequest;
import com.proyecto.abastix.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<List<OrderDto>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer customerId) {
        return ResponseEntity.ok(orderService.listar(status, customerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<OrderDto> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<OrderDto> crear(
            @Valid @RequestBody OrderRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.crear(request, principal.getName()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<OrderDto> actualizarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(orderService.actualizarEstado(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<OrderDto> cambiarEstadoPatch(
            @PathVariable Integer id,
            @Valid @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(orderService.actualizarEstado(id, request));
    }
}
