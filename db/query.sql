SELECT 
    employees.first_name,
    employees.last_name,
    roles.title,
    departments.name

FROM 
    employees
JOIN 
    roles ON employees.role_id = roles.id
JOIN 
    departments ON roles.department_id = departments.id;
