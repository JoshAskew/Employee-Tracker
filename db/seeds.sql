INSERT INTO departments (name)
VALUES ('Sales'),
('Human Resources'),
('Marketing'),
('Finance');

INSERT INTO roles (title, salary, department_id)
VALUES ('Sales Rep', 60000, 1),
('Human Resources Rep', 50000, 2),
('Senior Product Marketing', 80000, 3),
('Accountant', 70000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, 3),
('Jane', 'Smith', 2, NULL),
('Bill', 'Anderson', 3, NULL),
('Sue', 'Davis', 4, NULL);
