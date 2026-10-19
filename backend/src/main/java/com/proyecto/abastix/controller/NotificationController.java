package com.proyecto.abastix.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.abastix.dto.NotificationDto;
import com.proyecto.abastix.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<List<NotificationDto>> listar(Principal principal) {
        return ResponseEntity.ok(notificationService.listar(principal != null ? principal.getName() : null));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<NotificationDto> marcarComoLeida(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.marcarComoLeida(id));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLEADO')")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(Principal principal) {
        long count = notificationService.contarNoLeidas(principal != null ? principal.getName() : null);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
