-- ============================================================
-- ABASTIX — ESQUEMA RELACIONAL E INICIALIZACION IDEMPOTENTE
-- Microsoft SQL Server 2022
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AbastixDB')
BEGIN
    CREATE DATABASE AbastixDB;
END;
GO

USE AbastixDB;
GO

-- =========================================
-- ROLES
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    );
END;
GO

-- =========================================
-- USERS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        active BIT NOT NULL,

        FOREIGN KEY (role_id) REFERENCES roles(id)
    );
END;
GO

-- =========================================
-- CATEGORIES
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
BEGIN
    CREATE TABLE categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        active BIT NOT NULL
    );
END;
GO

-- =========================================
-- PRODUCTS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
BEGIN
    CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        sku VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL,
        min_stock INT NOT NULL,
        active BIT NOT NULL,

        FOREIGN KEY (category_id) REFERENCES categories(id)
    );
END;
GO

-- =========================================
-- CUSTOMERS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customers')
BEGIN
    CREATE TABLE customers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        document VARCHAR(30) NOT NULL,
        phone VARCHAR(30),
        email VARCHAR(150),
        active BIT NOT NULL
    );
END;
GO

-- =========================================
-- ORDERS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
BEGIN
    CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        customer_id INT NOT NULL,
        user_id INT NOT NULL,
        status VARCHAR(30) NOT NULL,
        payment_method VARCHAR(30) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL,

        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;
GO

-- =========================================
-- ORDER DETAILS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_details')
BEGIN
    CREATE TABLE order_details (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,

        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
END;
GO

-- =========================================
-- INVENTORY MOVEMENTS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'inventory_movements')
BEGIN
    CREATE TABLE inventory_movements (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        quantity INT NOT NULL,
        reason VARCHAR(100) NOT NULL,
        order_id INT NULL,
        user_id INT NOT NULL,
        created_at DATETIME NOT NULL,

        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;
GO

-- =========================================
-- NOTIFICATIONS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        message VARCHAR(500) NOT NULL,
        [read] BIT NOT NULL,
        created_at DATETIME NOT NULL,

        FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;
GO

-- =========================================
-- AUDIT LOGS
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
BEGIN
    CREATE TABLE audit_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL,

        FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;
GO

-- =========================================
-- SEED DATA (Solo si las tablas estan vacias)
-- =========================================
IF NOT EXISTS (SELECT 1 FROM categories)
BEGIN
    INSERT INTO categories (name, active) VALUES
    ('Laptops', 1),
    ('Monitores', 1),
    ('Periféricos', 1),
    ('Componentes', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM products)
BEGIN
    INSERT INTO products 
    (category_id, name, sku, price, stock, min_stock, active) VALUES
    (1, 'Laptop Lenovo IdeaPad 3', 'LAP-001', 1899.90, 10, 3, 1),
    (1, 'Laptop HP 15', 'LAP-002', 2199.90, 8, 3, 1),
    (1, 'Laptop ASUS VivoBook 15', 'LAP-003', 2499.90, 6, 2, 1),
    (2, 'Monitor LG 24 pulgadas', 'MON-001', 599.90, 15, 5, 1),
    (2, 'Monitor Samsung 27 pulgadas', 'MON-002', 899.90, 10, 3, 1),
    (3, 'Teclado Mecánico Redragon', 'PER-001', 159.90, 20, 5, 1),
    (3, 'Mouse Logitech G203', 'PER-002', 99.90, 25, 5, 1),
    (3, 'Audífonos HyperX Cloud II', 'PER-003', 299.90, 12, 3, 1),
    (4, 'Memoria RAM Kingston 16GB', 'COM-001', 189.90, 18, 5, 1),
    (4, 'SSD Kingston 1TB', 'COM-002', 329.90, 14, 4, 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM customers)
BEGIN
    INSERT INTO customers (full_name, document, phone, email, active) VALUES
    ('Juan Carlos Perez', '72845123', '987654321', 'juan.perez@gmail.com', 1),
    ('Maria Fernanda Lopez', '71563284', '986543210', 'maria.lopez@gmail.com', 1),
    ('Carlos Alberto Ramirez', '70458961', '985432109', 'carlos.ramirez@gmail.com', 1),
    ('Ana Sofia Torres', '73984512', '984321098', 'ana.torres@gmail.com', 1),
    ('Luis Miguel Garcia', '76231458', '983210987', 'luis.garcia@gmail.com', 1),
    ('Patricia Elena Flores', '71896543', '982109876', 'patricia.flores@gmail.com', 1),
    ('Diego Alejandro Mendoza', '75142896', '981098765', 'diego.mendoza@gmail.com', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM roles)
BEGIN
    INSERT INTO roles (name) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_EMPLEADO');
END;
GO