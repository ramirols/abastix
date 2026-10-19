package com.proyecto.abastix.rabbit;

import java.time.LocalDateTime;

public class LowStockEvent {

    private String eventType; // LOW_STOCK
    private Integer productId;
    private String productName;
    private String sku;
    private Integer currentStock;
    private Integer minStock;
    private LocalDateTime timestamp;

    public LowStockEvent() {
    }

    public LowStockEvent(String eventType, Integer productId, String productName, String sku, Integer currentStock, Integer minStock, LocalDateTime timestamp) {
        this.eventType = eventType;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.currentStock = currentStock;
        this.minStock = minStock;
        this.timestamp = timestamp;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
