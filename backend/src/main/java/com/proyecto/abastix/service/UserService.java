package com.proyecto.abastix.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.UserCreateRequest;
import com.proyecto.abastix.dto.UserDto;
import com.proyecto.abastix.dto.UserUpdateRequest;
import com.proyecto.abastix.entity.Role;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.RoleRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditPublisher audit;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuditPublisher audit) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listar() {
        return userRepository.findAllByOrderByIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UserDto obtener(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return toDto(user);
    }

    @Transactional
    public UserDto crear(UserCreateRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un usuario con el correo " + email);
        }

        String roleName = normalizeRoleName(request.role());
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(null, roleName)));

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setActive(true);

        User saved = userRepository.save(user);
        audit.publicar("CREAR", "users", "Se creó usuario " + saved.getEmail());
        return toDto(saved);
    }

    @Transactional
    public UserDto actualizar(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String roleName = normalizeRoleName(request.role());
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(null, roleName)));

        user.setFullName(request.fullName().trim());
        user.setRole(role);

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        User saved = userRepository.save(user);
        audit.publicar("ACTUALIZAR", "users", "Se actualizó usuario " + saved.getEmail());
        return toDto(saved);
    }

    @Transactional
    public UserDto desactivar(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setActive(false);
        User saved = userRepository.save(user);
        audit.publicar("DESACTIVAR", "users", "Se desactivó usuario " + saved.getEmail());
        return toDto(saved);
    }

    @Transactional
    public UserDto activar(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setActive(true);
        User saved = userRepository.save(user);
        audit.publicar("ACTIVAR", "users", "Se activó usuario " + saved.getEmail());
        return toDto(saved);
    }

    private String normalizeRoleName(String role) {
        String trimmed = role.trim().toUpperCase();
        if (trimmed.equals("ADMIN")) return "ROLE_ADMIN";
        if (trimmed.equals("EMPLEADO") || trimmed.equals("EMPLOYEE")) return "ROLE_EMPLEADO";
        if (trimmed.startsWith("ROLE_")) return trimmed;
        return "ROLE_" + trimmed;
    }

    private UserDto toDto(User u) {
        return new UserDto(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole() != null ? u.getRole().getName() : null,
                u.getActive());
    }
}
