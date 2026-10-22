package com.proyecto.abastix.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyecto.abastix.dto.AuthResponse;
import com.proyecto.abastix.dto.LoginRequest;
import com.proyecto.abastix.dto.RefreshRequest;
import com.proyecto.abastix.dto.UserDto;
import com.proyecto.abastix.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public AuthController(AuthService authService,
            @Value("${jwt.cookie-secure:false}") boolean cookieSecure,
            @Value("${jwt.cookie-same-site:Lax}") String cookieSameSite) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", authResponse.accessToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(authResponse.expiresIn())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.refresh(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", authResponse.accessToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(authResponse.expiresIn())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof String email)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.me(email));
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (token == null) {
            token = (CsrfToken) request.getAttribute("_csrf");
        }
        if (token == null) {
            return ResponseEntity.ok(Map.of());
        }
        return ResponseEntity.ok(Map.of(
                "token", token.getToken(),
                "headerName", token.getHeaderName(),
                "parameterName", token.getParameterName()));
    }
}
