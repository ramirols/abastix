package com.proyecto.abastix.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyecto.abastix.entity.InventoryMovement;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Integer> {

    List<InventoryMovement> findAllByOrderByCreatedAtDesc();

    List<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Integer productId);
}
