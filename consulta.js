// consulta.js
const oracledb = require('oracledb');
const dbConfig = require('./dbConfig');
const query = require('./query');

async function run() {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query);
        console.log(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();
