const express = require('express')
const router = express.Router()

router.get('/teste', async (req, res) => {
    console.log('rota acessada com sucesso')
    res.send('rota acessada com sucesso')
})

module.exports = router