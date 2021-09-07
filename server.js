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
                case 'View All Employees':
                    viewEmployees()
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
                case 'Update An Employee Role':
                    updateEmployee();
                    break;
                default:
                    break;
            }
        })

}

// view all departments
// formatted table with deparment names and department ids
const viewDepts = async () => {
    const sql = `SELECT * FROM departments;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table('All Departments', res);
        return;
    });
    promptUser();
}

// view all roles
// formatted table with job titles, role id, the department that the role belongs to, and salary for that role
const viewRoles = () => {
    const sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles JOIN departments ON departments.id = roles.department_id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table('All Roles', res)
    });
    promptUser();
};

// view all employees
// formatted table showing employee ids, first names, last names, job titles, departments, salaries, and managers that employee reports to
const viewEmployees = () => {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM departments JOIN roles ON departments.id = roles.department_id JOIN employees ON employees.role_id = roles.id LEFT JOIN employees manager on employees.manager_id = manager.id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table('All Employees', res)
    });
    promptUser();
}

// add a department
// prompt to enter name of department 
// department is added to database
const addDept = () => {
    inquirer
        .prompt([
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
            // can maybe get rid of this?
            // db.query(`SELECT * FROM departments;`, (err, res) => {
            //     if (err) throw err;
            //     console.table(res);
            // })
        });
    promptUser(); // WHY does it keep showing up all jumbled...before the input prompt and the table.. also shows up a second time after hitting arrow keys
    // promptUser();
}

// add a role
// prompt to enter name, salary, and department for that role
// role is added to database
const addRole = () => {
    db.query(`SELECT * FROM departments`, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
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
                    type: 'list',
                    name: 'department',
                    choices: function () {
                        let choiceArr = [];
                        res.forEach(res => choiceArr.push(res.name))
                        return choiceArr;
                    },
                    message: 'What department does this role belong to?'
                }
            ])
            .then(roleInfo => {
                const sql = `INSERT INTO roles (name, salary, department) VALUES (?,?,?);`;
                const params = [roleInfo.roleName, roleInfo.salary, roleInfo.department];
                db.query(sql, params, (err, res) => {
                    if (err) throw err;
                    console.log(`${roleInfo.roleName} successfully added to the roles table in the comapany database.`)
                });
                db.query(`SELECT * FROM roles`, (err, res) => {
                    if (err) throw err;
                    console.table(res)
                });
            }).then(promptUser());
        // promptUser();
    });
};

// add an employee
// prompt to enter first name, last name, role, and manager
// employee is added to database 
const addEmployee = () => {
    db.query(`SELECT * FROM roles`, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'role',
                    choices: function () {
                        let choiceArr = [];
                        res.forEach(res => choiceArr.push(res.title))
                        return choiceArr;
                    },
                    message: "What is this employee's role?"
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
                db.query(`SELECT * FROM roles`, (err, res) => {
                    if (err) throw err;
                    for (let i = 0; i < res.length; i++) {
                        if (res.title === employeeInfo.role) {
                            
                            return true;
                        }
                    }
                    
                    return res.json;
                })
            
                const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?);`;
                const params = [employeeInfo.firstName, employeeInfo.lastName, res.id, employeeInfo.managerId];
                db.query(sql, params, (err, res) => {
                    if (err) throw err;
                    console.table(res)
                })
            })
                
            
    })
}

// update an employee role
// prompt to selet an employee to update
// new role and info is updated in the database

promptUser();