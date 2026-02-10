CREATE DATABASE tiket_kereta;
USE tiket_kereta;


CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50),
password VARCHAR(255),
role VARCHAR(20)
);


CREATE TABLE tickets (
id INT AUTO_INCREMENT PRIMARY KEY,
train_name VARCHAR(100),
origin VARCHAR(100),
destination VARCHAR(100),
price INT
);


CREATE TABLE orders (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
ticket_id INT,
quantity INT,
status VARCHAR(50),
payment_proof TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'), /* password: Anakhebatjuara */
('user1', 'user123', 'user'); /* password: user123 */


INSERT INTO tickets (train_name, origin, destination, price) VALUES
('Argo Bromo', 'Jakarta', 'Surabaya', 350000),
('Taksaka', 'Jakarta', 'Yogyakarta', 300000);