const express = require('express')
const router = express.Router()
const { getConnection, oracledb } = require('../database/oracleConnection')
const { existsOrError } = require('./validations');


router.get('/books', async (req, res) => {
	let connection

	try {
		connection = await getConnection()

		const select = `SELECT * FROM BOOKS`

		const result = await connection.execute(select, [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
		// Adicione essas linhas para ajudar na depuração
		console.log('Query result rows:', result.rows)

		res.status(200).json(result.rows) // Pegando a resposta e enviando para o frontend
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	} finally {
		if (connection) {
			await connection.close()
		}
	}
})

router.post('/books', async (req, res) => {
    const {title, author, pages, thumbnail } = req.body //vai vir do front esses dados ou do postman para teste

    try {
        existsOrError(title, 'O Titulo não foi nformado')
        existsOrError(author, 'O Titulo não foi nformado')
        existsOrError(pages, 'O Titulo não foi nformado')
    } catch (msg) {
        return res.status(400).send(msg)
    }

    let connection
    try {
        connection = await getConnection()
        const result = await connection.execute(
            `INSERT INTO BOOKS (title, author, pages, thumbnail) VALUES (:title, :author, :pages, :thumbnail)`,
            {title, author, pages, thumbnail},
            { autoCommit: true}
        )
        if (result.rowsAffected) res.status(201).send('Registro criado com sucesso')

    } catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	} finally {
		if (connection) {
			await connection.close()
		}
	}
})

module.exports = router
