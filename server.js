// variables
const db = require('./db/connection');
const express = require('express');
const inquirer = require('inquirer');
const cTable = require('console.table'); 

const app = express();
const PORT = process.env.PORT || 3001;
// express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
 
db.promise().connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Prompt the user to make a choice
const promptUser = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Please choose from the following options.',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role', 'Done']
        }
    ])
    .then(userSelect => {
        switch (userSelect.action) {
            case 'View All Departments': 
                viewDepts();
                break;
            case 'View All Roles':
                viewRoles()
                break;
        }
    })
    
}

// view all departments
    // formatted table with deparment names and department ids
const viewDepts = () => {
    const sql = `SELECT * FROM departments;`;
    db.query(sql, (err, res) => {
       if (err) throw err;
       console.table('All Departments', res)
    })   
}

// view all roles
    // formatted table with job titles, role id, the department that the role belongs to, and salary for that role
    const viewRoles = () => {
        const sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles JOIN departments ON departments.id = roles.department_id;`;
        db.query(sql, (err, res) => {
            if (err) throw err;
            console.table('All Roles', res)
        });
    };

// view all employees
    // formatted table showing employee ids, first names, last names, job titles, departments, salaries, and managers that employee reports to

// add a department
    // prompt to enter name of department 
    // department is added to database

// add a role
    // prompt to enter name, salary, and department for that role
    // role is added to database

// add an employee
    // prompt to enter first name, last name, role, and manager
    // employee is added to database 

// update an employee role
    // prompt to selet an employee to update
    // new role and info is updated in the database

    promptUser();