const {createPool} = require('mysql');
let mysql;


mysql = createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        connectionLimit: 2,
        timezone: "+00:00",
        multipleStatements: true
    });


module.exports = mysql;
