const oracledb = require('oracledb')
require('dotenv').config()

const config = {
    user: process.env.USER, //FIRSTAPP
    password: process.env.PASSWORD, //FIRSTAPP
    connectString: process.env.DATABSE_URL, //localhost:1521/XEPDB1
}

async function getConnection() {
    const connection = await oracledb.getConnection(config)
    return connection
}

module.exports = { getConnection, oracledb}