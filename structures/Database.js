const mysql = require("mysql");
module.exports = class Utils {

    constructor() {

    }

    async init() {
        this.pool =  mysql.createPool({
            connectionLimit: 10,
            host: process.env.dbhost,
            user: process.env.dbusr,
            password: process.env.dbpasswd,
            database: process.env.dbname
        });

    }

    async testConnection() {
        this.pool.getConnection(function(err,connection){
            if(err) {
                // TODO - Logging
                console.error(`Connection to DB failed: ${err.code}`)
                return false;
            }
            connection.release();
            return true;
        });
    }
}