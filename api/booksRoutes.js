const express = require('express')
const router = express.Router()
const { getConnection, oracledb } = require('../database/oracleConnection')
const { existsOrError } = require('./validations')

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
	const { title, author, pages, thumbnail } = req.body //vai vir do front esses dados ou do postman para teste

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
			`INSERT INTO books (TITLE, AUTHOR, PAGES, THUMBNAIL) VALUES (:title, :author, :pages, :thumbnail) RETURNING ID INTO :id`,
			{
				title,
				author,
				pages,
				thumbnail,
				id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
			}
		)

		await connection.commit()

		// Retorne o livro recém-adicionado com o ID gerado
		const newBook = {
			ID: result.outBinds.id[0],
			TITLE: title,
			AUTHOR: author,
			PAGES: pages,
			THUMBNAIL: thumbnail,
		}

		res.status(201).json(newBook)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	} finally {
		if (connection) {
			await connection.close()
		}
	}
})

router.delete('/books/:id', async (req, res) => {
	const id = req.params.id //pegar o id da requisição
  console.log(id)

	let connection

	try {
		connection = await getConnection() //cria a conexão com o banco de dados

		const result = await connection.execute(`DELETE FROM BOOKS WHERE id = :1`, [id])

		if (result.rowsAffected === 0) { // se tiver alguma linha que não foi afetada
			res.status(404).send('Registro não encontrado') //então registro não encontrado
		} else {
			await connection.commit() // faço o commit no db
			res.status(200).send('Registro removido com sucesso') //envio a resposta para o frontend
		}
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
