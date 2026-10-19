package com.proyecto.abastix.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proyecto.abastix.dto.AuthResponse;
import com.proyecto.abastix.dto.LoginRequest;
import com.proyecto.abastix.dto.RefreshRequest;
import com.proyecto.abastix.dto.UserDto;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.UserRepository;
import com.proyecto.abastix.security.JwtService;

import io.jsonwebtoken.JwtException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditPublisher audit;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditPublisher audit) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.audit = audit;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BadCredentialsException("Usuario inactivo");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales invalidas");
        }

        audit.publicar("LOGIN", "users", "Se logueo " + user.getEmail(), user.getId());

        return toResponse(user);
    }

    /**
     * Refresh stateless con rotacion: valida que sea type=refresh y emite par nuevo.
     */
    public AuthResponse refresh(RefreshRequest request) {
        final String email;
        try {
            if (!jwtService.isRefreshToken(request.refreshToken())) {
                throw new BadCredentialsException("Refresh token invalido");
            }
            email = jwtService.extractEmail(request.refreshToken());
        } catch (JwtException e) {
            throw new BadCredentialsException("Refresh token expirado o invalido");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Refresh token invalido"));
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BadCredentialsException("Usuario inactivo");
        }
        return toResponse(user);
    }

    public UserDto me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
        return toDto(user);
    }

    private AuthResponse toResponse(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        return new AuthResponse(access, refresh, "Bearer",
                jwtService.getAccessExpirationMs() / 1000, toDto(user));
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getFullName(),
                user.getEmail(), user.getRole().getName(), user.getActive());
    }
}
