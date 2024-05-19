const oracledb = require('oracledb')
require('dotenv').config()

const config = {
    user: process.env.USER, //BOOKSIREAD
    password: process.env.PASSWORD, //BOOKSIREAD
    connectString: process.env.DATABSE_URL, //localhost:1521/XEPDB1
}

async function getConnection() {
    const connection = await oracledb.getConnection(config)
    return connection
}

module.exports = { getConnection, oracledb}