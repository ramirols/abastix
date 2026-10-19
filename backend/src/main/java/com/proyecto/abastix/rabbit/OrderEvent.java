package com.proyecto.abastix.rabbit;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderEvent {

    private String eventType; // ORDER_CONFIRMED
    private Integer orderId;
    private BigDecimal total;
    private String customerName;
    private Integer userId;
    private LocalDateTime timestamp;

    public OrderEvent() {
    }

    public OrderEvent(String eventType, Integer orderId, BigDecimal total, String customerName, Integer userId, LocalDateTime timestamp) {
        this.eventType = eventType;
        this.orderId = orderId;
        this.total = total;
        this.customerName = customerName;
        this.userId = userId;
        this.timestamp = timestamp;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
