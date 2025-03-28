BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS AI_Models CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Role_Permissions CASCADE;
DROP TABLE IF EXISTS Permissions CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;
DROP TABLE IF EXISTS Organizations CASCADE;

-- Create Tables
CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INT NOT NULL,
  organization_id INT,
  user_progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE Role_Permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY(role_id, permission_id),
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES Roles (role_id),
  CONSTRAINT fk_permission FOREIGN KEY (permission_id) REFERENCES Permissions (permission_id)
);

CREATE TABLE Organizations (
  organization_id SERIAL PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AI_Models (
  model_id SERIAL PRIMARY KEY,
  model_name VARCHAR(255) NOT NULL,
  owner_id INT NOT NULL,
  organization_id INT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description VARCHAR(255),
  CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES Users (user_id),
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES Organizations (organization_id)
);

-- Add Foreign Keys for Users
ALTER TABLE Users 
ADD CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES Roles (role_id),
ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES Organizations (organization_id);

-- Insert Roles
INSERT INTO Roles (role_name) VALUES ('Admin'), ('User');

-- Insert Permissions
INSERT INTO Permissions (permission_name, description) VALUES 
('view_data', 'Allows viewing data'),
('edit_data', 'Allows editing data'),
('delete_data', 'Allows deleting data'),
('manage_users', 'Allows managing user accounts');

-- Assign Permissions to Roles
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT Roles.role_id, Permissions.permission_id
FROM Roles
JOIN Permissions ON
  (Roles.role_name = 'Admin') OR 
  (Roles.role_name = 'User' AND Permissions.permission_name = 'view_data');

-- Insert Example Users-- We will make a change later in backend(GET METHOD)
INSERT INTO Users (username, email, password_hash, role_id) 
VALUES 
('admin_user1', 'admin@example.com', 'hashed_password',
(SELECT role_id FROM Roles WHERE role_name = 'Admin')),
('admin_user2', 'admin2@example.com', 'hashed_password', 

 (SELECT role_id FROM Roles WHERE role_name = 'Admin')),
('normal_user', 'user@example.com', 'hashed_password', 
 (SELECT role_id FROM Roles WHERE role_name = 'User'));



COMMIT;
SELECT u.username, r.role_name, STRING_AGG(p.permission_name, ', ') AS permissions
FROM Users u 
JOIN Roles r ON u.role_id = r.role_id
JOIN Role_Permissions rp ON rp.role_id = r.role_id
JOIN Permissions p ON rp.permission_id = p.permission_id
GROUP BY u.username, r.role_name;



