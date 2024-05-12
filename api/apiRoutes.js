const express = require('express')
const router = express.Router()
const { getConnection, oracledb } = require('../database/oracleConnection')
const { existsOrError } = require('./validations')

router.get('/teste', async (req, res) => {
	console.log('rota acessada com sucesso')
	res.send('rota acessada com sucesso')
})

router.post('/usuarios', async (req, res) => {
	const { nome, telefone, email, dataNascimento } = req.body

	try {
		existsOrError(nome, 'O nome não foi informado')
		existsOrError(telefone, 'O telefone não foi informado')
		existsOrError(email, 'O email não foi informado')
		existsOrError(dataNascimento, 'O dataNascimento não foi informado')
	} catch (msg) {
		return res.status(400).send(msg) //aqui eu estarei enviando a mensagem para o usuario na tela.
	}

	let conn

	try {
		conn = await getConnection()

		const result = await conn.execute(
			'INSERT INTO PESSOA (nome, telefone, email, data_nascimento) values (:1, :2, :3, :4)', //comando para o banco de dados
			[nome, telefone, email, dataNascimento]
		)

        if(result.rowsAffected) { //se o conn der certo, ele vai adicionar uma linha, logo 
            await conn.commit() //eu quero commitar no oracle isso.

            res.status(201).send() //mandar pro usuario um 201 que foi com sucesso.
        }
	} catch (error) {
        console.log(error)
        res.status(500).json(error) //enviar para o usuario o erro
    } finally { //para finalizar então
        if (conn) {
            await conn.close() //fechar a conexão com o oracle
        }
    }
})

module.exports = router
