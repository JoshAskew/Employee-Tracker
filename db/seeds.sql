INSERT INTO departments (name)
VALUES ('Sales'),
('Human Resources'),
('Engineering'),
('Finance');

INSERT INTO roles (title, salary, department_id)
VALUES ('Sales Rep', 80000, 1),
('Human Resources Rep', 60000, 2),
('Senior Engineer', 140000, 3),
('Junior Engineer', 90000, 3),
('Account Manager', 120000, 4),
('Accountant', 80000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Bill', 'Anderson', 3, NULL),
('Sue', 'Davis', 4, 3),
('Jim', 'Dawson', 5, NULL),
('Frank', 'Goldman', 6, 5);
