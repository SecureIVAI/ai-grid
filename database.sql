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
  PRIMARY KEY(role_id,permission_id)
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
  description VARCHAR(255)
);

ALTER TABLE Users ADD FOREIGN KEY (role_id) REFERENCES Roles (role_id);

ALTER TABLE Users ADD FOREIGN KEY (organization_id) REFERENCES Organizations (organization_id);

ALTER TABLE Role_Permissions ADD FOREIGN KEY (role_id) REFERENCES Roles (role_id);

ALTER TABLE Role_Permissions ADD FOREIGN KEY (permission_id) REFERENCES Permissions (permission_id);

ALTER TABLE AI_Models ADD FOREIGN KEY (owner_id) REFERENCES Users (user_id);

ALTER TABLE AI_Models ADD FOREIGN KEY (organization_id) REFERENCES Organizations (organization_id);
