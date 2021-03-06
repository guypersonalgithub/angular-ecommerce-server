const mysql = require('mysql');

// Connecting to mysql. Before choosing a database, I decided to make everything automatic, so I wouldn't have to use mySql's workbench.
const connection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,

});

function execute(sql) {
    return new Promise ((resolve, reject) => {
        connection.query (sql, (err, result) => {
            if (err) {
                console.log("Error " + err);
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

function executeWithParameters(sql, parameters) {
    return new Promise ((resolve, reject) => {
        connection.query (sql, parameters, (err, result) => {
            if (err) {
                console.log("Error " + err);
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

module.exports = {
    execute,
    executeWithParameters
}