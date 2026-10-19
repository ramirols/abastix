package com.proyecto.abastix.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.NotificationDto;
import com.proyecto.abastix.entity.Notification;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.NotificationRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listar(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        List<Notification> list;
        if (user != null && "ROLE_ADMIN".equals(user.getRole().getName())) {
            list = notificationRepository.findAllByOrderByCreatedAtDesc();
        } else if (user != null) {
            list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        } else {
            list = notificationRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::toDto).toList();
    }

    @Transactional
    public NotificationDto marcarComoLeida(Integer id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));
        notif.setRead(true);
        Notification saved = notificationRepository.save(notif);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && "ROLE_ADMIN".equals(user.getRole().getName())) {
            return notificationRepository.countByReadFalse();
        } else if (user != null) {
            return notificationRepository.countByUserIdAndReadFalse(user.getId());
        }
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public Notification crearNotificacion(String type, String message, Integer userId) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        if (user == null) {
            user = userRepository.findByEmail("admin@abastix.com").orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (user == null) return null;

        Notification notif = new Notification(null, user, type, message, false, LocalDateTime.now());
        return notificationRepository.save(notif);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getUser() != null ? n.getUser().getId() : null,
                n.getType(),
                n.getMessage(),
                n.getRead(),
                n.getCreatedAt());
    }
}
