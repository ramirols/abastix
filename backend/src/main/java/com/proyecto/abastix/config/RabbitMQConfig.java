package com.proyecto.abastix.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "abastix.exchange";

    public static final String NOTIFICATIONS_QUEUE = "notifications.queue";
    public static final String ROUTING_KEY_NOTIFICATIONS = "notification.#";
    public static final String ROUTING_KEY_ORDER = "notification.order";
    public static final String ROUTING_KEY_STOCK = "notification.stock";

    public static final String LOG_QUEUE = "log.queue";
    public static final String ROUTING_KEY_LOG = "log.#";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationsQueue() {
        return new Queue(NOTIFICATIONS_QUEUE, true);
    }

    @Bean
    public Queue logQueue() {
        return new Queue(LOG_QUEUE, true);
    }

    @Bean
    public Binding notificationsBinding(Queue notificationsQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationsQueue).to(exchange).with(ROUTING_KEY_NOTIFICATIONS);
    }

    @Bean
    public Binding logBinding(Queue logQueue, TopicExchange exchange) {
        return BindingBuilder.bind(logQueue).to(exchange).with(ROUTING_KEY_LOG);
    }

    @Bean
    public JacksonJsonMessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
