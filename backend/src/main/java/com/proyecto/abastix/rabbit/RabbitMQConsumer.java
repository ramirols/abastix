package com.proyecto.abastix.rabbit;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.abastix.config.RabbitMQConfig;
import com.proyecto.abastix.entity.Evento;
import com.proyecto.abastix.entity.Log;
import com.proyecto.abastix.entity.Notification;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.LogRepository;
import com.proyecto.abastix.repository.NotificationRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class RabbitMQConsumer {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final LogRepository logRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public RabbitMQConsumer(LogRepository logRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.LOG_QUEUE)
    @Transactional
    public void recibirAuditoria(Evento evento) {
        if (evento.getUserId() == null) {
            log.warn("Evento de auditoría descartado: userId nulo");
            return;
        }
        User user = userRepository.findById(evento.getUserId()).orElse(null);
        if (user == null) {
            log.warn("Evento de auditoría descartado: usuario no existe");
            return;
        }
        Log audit = new Log();
        audit.setUser(user);
        audit.setAction(evento.getAccion() + " - " + evento.getDescripcion());
        audit.setEntity(evento.getTabla());
        audit.setCreatedAt(LocalDateTime.now());
        logRepository.save(audit);
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATIONS_QUEUE)
    @Transactional
    public void recibirNotificacion(Object event) {
        try {
            if (event instanceof OrderEvent orderEvent) {
                procesarOrderEvent(orderEvent);
            } else if (event instanceof LowStockEvent lowStockEvent) {
                procesarLowStockEvent(lowStockEvent);
            } else {
                log.info("Mensaje genérico recibido en notifications.queue: {}", event);
            }
        } catch (Exception e) {
            log.error("Error al procesar evento en notifications.queue: {}", e.getMessage(), e);
        }
    }

    public void procesarOrderEvent(OrderEvent orderEvent) {
        User user = null;
        if (orderEvent.getUserId() != null) {
            user = userRepository.findById(orderEvent.getUserId()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail("admin@abastix.com").orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (user == null) return;

        Notification notif = new Notification();
        notif.setUser(user);
        notif.setType("ORDER_CONFIRMED");
        notif.setMessage("Pedido #" + orderEvent.getOrderId() + " confirmado por S/ " +
                orderEvent.getTotal() + " para el cliente " + orderEvent.getCustomerName());
        notif.setRead(false);
        notif.setCreatedAt(orderEvent.getTimestamp() != null ? orderEvent.getTimestamp() : LocalDateTime.now());
        notificationRepository.save(notif);
        log.info("Notificación persistida para Pedido #{}", orderEvent.getOrderId());
    }

    public void procesarLowStockEvent(LowStockEvent lowStockEvent) {
        User adminUser = userRepository.findByEmail("admin@abastix.com").orElse(null);
        if (adminUser == null) {
            adminUser = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (adminUser == null) return;

        Notification notif = new Notification();
        notif.setUser(adminUser);
        notif.setType("LOW_STOCK");
        notif.setMessage("Alerta de stock bajo: " + lowStockEvent.getProductName() +
                " (" + lowStockEvent.getSku() + ") cuenta con " + lowStockEvent.getCurrentStock() +
                " unidades (mínimo: " + lowStockEvent.getMinStock() + ")");
        notif.setRead(false);
        notif.setCreatedAt(lowStockEvent.getTimestamp() != null ? lowStockEvent.getTimestamp() : LocalDateTime.now());
        notificationRepository.save(notif);
        log.info("Notificación persistida para Stock Bajo en producto {}", lowStockEvent.getProductName());
    }
}
