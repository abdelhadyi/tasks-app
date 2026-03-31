-- Create and select the database
CREATE DATABASE IF NOT EXISTS microservices_db;
USE microservices_db;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    title  VARCHAR(255) NOT NULL,
    status ENUM('Not started', 'in-progress', 'done') NOT NULL DEFAULT 'Not started'
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL
);
