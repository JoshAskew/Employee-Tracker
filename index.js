import inquirer from 'inquirer';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import figlet from 'figlet';

dotenv.config();

const client = new Client({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
});

// Function to connect to the PostgreSQL database
async function connectDB() {
    try {
        await client.connect();
        console.log('Connection successful');
        await promptUser();
    } catch (err) {
        console.error('Connection error', err.stack);
    }
}

figlet.text(
    "Employee Manager",
    {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 100,
        whitespaceBreak: true,
    },
    function (err, data) {
        if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
        }
        console.log(data);
    }
);

// Function to prompt user for action
async function promptUser() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all Employees',
                'View all Roles',
                'View all Departments',
                'Add an Employee',
                'Add Role',
                'Add Department',
                'Update Employee Role',
                'View Total Utilized Budget',
                'Delete Employee',
                'Delete a Role',
                'Delete a Department',
                'Exit'
            ],
        },
    ]);

    switch (answers.action) {
        case 'View all Employees':
            await viewAllEmployees();
            break;

        case 'Add an Employee':
            await addEmployee();
            break;

        case 'Update Employee Role':
            await updateEmployeeRole();
            break;

        case 'View all Roles':
            await viewAllRoles();
            break;

        case 'Add Role':
            await addRole();
            break;

        case 'View all Departments':
            await viewAllDepartments();
            break;

        case 'Add Department':
            await addDepartment();
            break;

        case 'Delete Employee':
            await deleteEmployee();
            break;

        case 'View Total Utilized Budget':
            await totalBudgetUsed();
            break;

        case 'Delete a Role':
            await deleteRole();
            break;

        case 'Delete a Department':
            await deleteDepartment();
            break;

        case 'Exit':
            await client.end(); // Close the client connection
            process.exit();

    }
}

// Function to view all employees with their corresponding roles
async function viewAllEmployees() {
   try {
        const res = await client.query(`
            SELECT 
                employees.id, 
                employees.first_name, 
                employees.last_name, 
                roles.title AS job_title,
                roles.salary AS salary, 
                departments.name AS department,
                CONCAT(managers.first_name, ' ', managers.last_name) AS manager_name
            FROM employees
            LEFT JOIN roles ON employees.role_id = roles.id
            LEFT JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees AS managers ON employees.manager_id = managers.id
        `);
        console.table(res.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
    promptUser();
}

// Function to add an employee
async function addEmployee() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the employee\'s first name:',
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the employee\'s last name:',
        },
        {
            type: 'input',
            name: 'roleId',
            message: 'Enter the employee\'s role ID:',
        },
        {
            type: 'input',
            name: 'managerId',
            message: 'Enter the employee\'s manager ID (leave blank if none):',
        },
    ]);

    try {
        await client.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
            [answers.firstName, answers.lastName, answers.roleId, answers.managerId || null]);
        console.log('Employee added!');
    } catch (error) {
        console.error('Error adding employee:', error);
    }

    promptUser();
}

// Function to update employee role
async function updateEmployeeRole() {
    try {
        const employeesRes = await client.query('SELECT id, CONCAT(first_name, \' \', last_name) AS full_name FROM employees');
        const employees = employeesRes.rows;

        const rolesRes = await client.query('SELECT id, title FROM roles');
        const roles = rolesRes.rows;

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'pickEmployee',
                message: 'Select the employee whose role you would like to change:',
                choices: employees.map(emp => ({ name: emp.full_name, value: emp.id })),
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: 'What is the new role for the employee?',
                choices: roles.map(role => ({ name: role.title, value: role.id })),
            },
        ]);

        const res = await client.query(
            `UPDATE employees 
             SET role_id = $1 WHERE id = $2`,
            [answers.newRoleId, answers.pickEmployee]
        );

        if (res.rowCount > 0) {
            console.log('Employee role updated successfully!');
        } else {
            console.log('Employee not found. Please check the ID and try again.');
        }
    } catch (error) {
        console.error('Error updating employee role:', error);
    }

    promptUser();
}
// Function to view all roles
async function viewAllRoles() {
    try {
         const res = await client.query(`
             SELECT 
            roles.id AS role_id,
            roles.title,
            roles.salary,
            departments.name AS department
             FROM roles
             JOIN departments ON roles.department_id = departments.id
         `);
         console.table(res.rows);
     } catch (error) {
         console.error('Error fetching all roles:', error);
     }
     promptUser();
 }

// Function to add a role
 async function addRole() {

    const departmentsRes = await client.query(`SELECT id, name FROM departments`);
    const department = departmentsRes.rows;

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the name of the new role you would like to create:',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the new role:',
        },
        {
            type: 'list',
            name: 'departmentId',
            message: 'What department is this for?',
            choices: department.map(department => ({ name: department.name, value: department.id })),
        },
    ]);

    try {
        await client.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
            [answers.title, answers.salary, answers.departmentId]);
            console.log('Role added!');
        } catch (error) {
            console.error('Error adding role:', error);
        }
        
        promptUser();
    }

// Function to view all departments
    async function viewAllDepartments() {
        try {
             const res = await client.query(`
                 SELECT 
                     id, name
                 FROM departments
             `);
             console.table(res.rows);
         } catch (error) {
             console.error('Error fetching departments:', error);
         }
         promptUser();
     }

// Function to add a department
async function addDepartment() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'newDepartment',
            message: 'Enter the name of the new department:',
        },
    ]);

    try {
        await client.query('INSERT INTO departments (name) VALUES ($1)',
            [answers.newDepartment || null]);
        console.log('Department added!');
    } catch (error) {
        console.error('Error adding department:', error);
    }

    promptUser();
}

async function deleteEmployee() {
    const employeesRes = await client.query('SELECT id, CONCAT(first_name, \' \', last_name) AS full_name FROM employees');
    const employees = employeesRes.rows;
    const answers = await inquirer.prompt([
        {
        type: 'list',
        name: 'employee',
        message: 'Which employee would you like to remove?',
        choices: employees.map(emp => ({ name: emp.full_name, value: emp.id })),
        },
    ]);

    try {
        const res = await client.query('DELETE FROM employees WHERE id = $1', [answers.employee]);

        if (res.rowCount > 0) {
            console.log(`Employee with ID ${answers.employee} has been deleted.`);
    } else {
        console.log('There is no employee with that ID.');
    }
    } catch (error) {
        console.error('Error deleting employee:', error)
    }
    promptUser();
};

async function totalBudgetUsed() {
    try {
    const res = await client.query('SELECT SUM(salary) AS utilized_budget FROM roles');
    
    console.table(res.rows);
    } catch (error) {
        console.error('Error retrieving data:', error)
    }
    promptUser();
    
};

async function deleteRole() {

    const rolesRes = await client.query('SELECT id, title FROM roles');
    const roles= rolesRes.rows;
    const answers = await inquirer.prompt([
        {
        type: 'list',
        name: 'role',
        message: 'Which role would you like to remove?',
        choices: roles.map(roles => ({ name: roles.title, value: roles.id })),
        },
    ]);

    const selectedRole = roles.find(rol => rol.id === answers.role);

    try {
        const res = await client.query('DELETE FROM roles WHERE id = $1', [answers.role]);

        if (res.rowCount > 0) {
            console.log(`The ${selectedRole.title} role has been deleted.`);
    } else {
        console.log('There is no role with that ID.');
    }
    } catch (error) {
        console.error('Error deleting role:', error)
    }
    promptUser();
}

async function deleteDepartment() {

    const departmentRes = await client.query('SELECT id, name FROM departments');
    const departments= departmentRes.rows;
    const answers = await inquirer.prompt([
        {
        type: 'list',
        name: 'department',
        message: 'Which department would you like to remove?',
        choices: departments.map(departments => ({ name: departments.name, value: departments.id })),
        },
    ]);

    const selectedDepartment = departments.find(dep => dep.id === answers.department);

    try {
        const res = await client.query('DELETE FROM departments WHERE id = $1', [answers.department]);

        if (res.rowCount > 0) {
            console.log(`${selectedDepartment.name} department has been deleted.`);
    } else {
        console.log('There is no department with that ID.');
    }
    } catch (error) {
        console.error('Error deleting department:', error)
    }
    promptUser();
};

// Start the application
connectDB();