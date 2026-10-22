package com.proyecto.abastix.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro que fuerza la carga del token diferido de CSRF (DeferredCsrfToken)
 * para que CookieCsrfTokenRepository emita la cookie XSRF-TOKEN en las respuestas.
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken == null) {
            csrfToken = (CsrfToken) request.getAttribute("_csrf");
        }
        if (csrfToken != null) {
            // Provocar la resolucion del token diferido para asegurar la cookie XSRF-TOKEN
            csrfToken.getToken();
        }

        filterChain.doFilter(request, response);
    }
}
