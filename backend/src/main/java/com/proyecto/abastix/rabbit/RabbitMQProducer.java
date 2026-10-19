package com.proyecto.abastix.rabbit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.proyecto.abastix.config.RabbitMQConfig;
import com.proyecto.abastix.entity.Evento;

@Service
public class RabbitMQProducer {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void enviarDatos(Evento evento) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    "log.audit",
                    evento);
        } catch (Exception e) {
            log.warn("No se pudo publicar evento de auditoría en RabbitMQ: {}", e.getMessage());
        }
    }

    public void publishOrderConfirmed(OrderEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_ORDER,
                    event);
            log.info("Evento ORDER_CONFIRMED publicado en RabbitMQ para orden #{}", event.getOrderId());
        } catch (Exception e) {
            log.warn("No se pudo publicar ORDER_CONFIRMED en RabbitMQ (RabbitMQ offline?): {}", e.getMessage());
        }
    }

    public void publishLowStock(LowStockEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY_STOCK,
                    event);
            log.info("Evento LOW_STOCK publicado en RabbitMQ para producto #{} ({})", event.getProductId(), event.getProductName());
        } catch (Exception e) {
            log.warn("No se pudo publicar LOW_STOCK en RabbitMQ (RabbitMQ offline?): {}", e.getMessage());
        }
    }
}
