package com.proyecto.abastix.dto;

import java.math.BigDecimal;

public record SalesChartPointDto(
        String date,
        BigDecimal total,
        long count) {
}
