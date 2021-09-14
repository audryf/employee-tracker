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
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee']
        }
    ])
        .then((userSelect) => {
            switch (userSelect.action) {
                case 'View All Departments':
                    viewDepts();
                    break;
                case 'View All Roles':
                    viewRoles();
                    break;
                case 'View All Employees':
                    viewEmployees();
                    break;
                case 'Add A Department':
                    addDept();
                    break;
                case 'Add A Role':
                    addRole();
                    break;
                case 'Add An Employee':
                    addEmployee();
                    break;
                default:
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
        console.table('All Departments', res);
        promptUser()
    });
}

// view all roles
// formatted table with job titles, role id, the department that the role belongs to, and salary for that role
const viewRoles = () => {
    const sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles JOIN departments ON departments.id = roles.department_id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table('All Roles', res)
        promptUser();
    });
};

// view all employees
// formatted table showing employee ids, first names, last names, job titles, departments, salaries, and managers that employee reports to
const viewEmployees = () => {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM departments JOIN roles ON departments.id = roles.department_id JOIN employees ON employees.role_id = roles.id LEFT JOIN employees manager on employees.manager_id = manager.id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table('All Employees', res)
        promptUser();
    });

}

// add a department
// prompt to enter name of department 
// department is added to database
const addDept = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'deptName',
            message: 'What department would you like to add?'
        }
    ])
        .then(deptInfo => {
            const sql = `INSERT INTO departments (name) VALUES (?);`;
            const params = [deptInfo.deptName]
            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`${deptInfo.deptName} successfully added to the departments table in the company database.`)
            });
            db.query(`SELECT * FROM departments;`, (err, res) => {
                if (err) throw err;
                console.table(res);
                promptUser();
            })
        });
}

// add a role
// prompt to enter name, salary, and department for that role
// role is added to database
const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'roleName',
            message: 'What is the title of the new role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'input',
            name: 'department',
            message: 'What department id does this role belong to?'
        }
    ])
        .then(roleInfo => {
            const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?);`;
            const params = [roleInfo.roleName, roleInfo.salary, roleInfo.department];
            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`${roleInfo.roleName} successfully added to the roles table in the comapany database.`)
                db.query(`SELECT * FROM roles`, (err, res) => {
                    if (err) throw err;
                    console.table(res)
                    promptUser()
                })
            });
        })
};

// add an employee
// prompt to enter first name, last name, role, and manager
// employee is added to database 
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What is this employee's role id?"
        },
        {
            type: 'input',
            name: 'firstName',
            message: "What is this employee's first name?"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is this employee's last name?"
        },
        {
            type: 'input',
            name: 'managerId',
            message: `What is this employee's manager's id number?`
        }
    ])
        .then(employeeInfo => {
            const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?);`;
            const params = [employeeInfo.firstName, employeeInfo.lastName, employeeInfo.role, employeeInfo.managerId];
            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.table(res)
            })
            db.query(`SELECT * FROM employees`, (err, res) => {
                if (err) throw err;
                console.table(res)
                promptUser()
            })
        })
}

promptUser();