const express = require('express')
const router = express.Router()
const { getConnection, oracledb } = require('../database/oracleConnection')



module.exports = router