INSERT INTO departments (name)
VALUES ('Receiving'), ('Shipping');

INSERT INTO roles (title, salary, department_id)
VALUES 
    ('Intern', 10000, 1),
    ('Associate', 80000, 2),
    ('Packer', 60000, 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
    ('Harry', 'Potter', 1, NULL),
    ('Leslie', 'Knope', 2, 1),
    ('Michael', 'Scott', 3, 1);