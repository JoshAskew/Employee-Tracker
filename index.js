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
        await promptUser(); // Start prompting user after successful connection
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
                'View all employees',
                'Add an employee',
                'Exit'
            ],
        },
    ]);

    switch (answers.action) {
        case 'View all employees':
            await viewAllEmployees();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Exit':
            await client.end(); // Close the client connection
            process.exit();
    }
}

// Function to view all employees
async function viewAllEmployees() {
    try {
        const res = await client.query('SELECT * FROM employees');
        console.table(res.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
    promptUser(); // Prompt user again after displaying data
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
    
    promptUser(); // Prompt user again after adding employee
}

// Start the application
connectDB();