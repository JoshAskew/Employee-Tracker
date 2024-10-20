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
                'Add an Employee',
                'Update Employee Role',
                'View all Roles',
                'Add Role',
                'View all Departments',
                'Add Department',
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

        case 'addDepartment':
            await addDepartment();
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
                roles.title AS role_title, 
                CONCAT(managers.first_name, ' ', managers.last_name) AS manager_name
            FROM employees
            LEFT JOIN roles ON employees.role_id = roles.id
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
        // Fetch all employees to populate the selection list
        const employeesRes = await client.query('SELECT id, CONCAT(first_name, \' \', last_name) AS full_name FROM employees');
        const employees = employeesRes.rows;

        // Fetch all roles to populate the role selection list
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

        // Update the employee's role
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

async function viewAllRoles() {
    try {
         const res = await client.query(`
             SELECT 
            roles.title,
            roles.salary
             FROM roles
         `);
         console.table(res.rows);
     } catch (error) {
         console.error('Error fetching all roles:', error);
     }
     promptUser();
 }

// Start the application
connectDB();