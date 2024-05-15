const express = require('express');
const router = express.Router();
const { getConnection, oracledb } = require('../database/oracleConnection');
const { existsOrError } = require('./validations');

router.get('/usuarios', async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const select = `SELECT * FROM USUARIOS`;

        const result = await conn.execute(select, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        // Adicione essas linhas para ajudar na depuração
        console.log('Query result rows:', result.rows);

        res.status(200).json(result.rows); // Pegando a resposta e enviando para o frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

module.exports = router;

/*
router.post('/usuariosadd', async (req, res) => {
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

		if (result.rowsAffected) {
			//se o conn der certo, ele vai adicionar uma linha, logo
			await conn.commit() //eu quero commitar no oracle isso.

            res.status(201).send('Registro criado com sucesso');
            
		}
	} catch (error) {
		console.log(error)
		res.status(500).json(error) //enviar para o usuario o erro
	} finally {
		//para finalizar então
		if (conn) {
			await conn.close() //fechar a conexão com o oracle
		}
	}
})
/*
router.put('/usuarios/:id', async (req, res) => {
	//tem q passar via paratro o ID
	const id = req.params.id // eu quero o ID que está nos parametros da minha requisição
	const { nome, telefone, email, dataNascimento } = req.body //o que eu espero no corpo da requisiçaõ

	try {
		existsOrError(nome, 'O Nome não foi informado.')
		existsOrError(telefone, 'O Telefone não foi informado.')
		existsOrError(email, 'O E-mail não foi informado.')
		existsOrError(dataNascimento, 'A data de nascimento não foi informada.')
	} catch (msg) {
		return res.status(400).send(msg)
	}

	let conn

	try {
		conn = await getConnection() //inicia a coneção

		const result = await conn.execute(
			//executando um update no meu banco de dados
			`UPDATE pessoa SET nome = :1, telefone = :2, email = :3, data_nascimento = :4
             WHERE id = :5`,
			[nome, telefone, email, dataNascimento, id]
		)

		if (result.rowsAffected === 0) {
			//verificando se alguma linha foi afetada
			res.status(404).json({ message: 'Registro não encontrado' })
		} else {
			await conn.commit() //comitar
			res.status(200).json({ message: 'Registro atualizado com sucesso' }) //devolvendo a resposta para o frontend
		}
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	} finally {
		if (conn) {
			await conn.close()
		}
	}
})

router.delete('/usuarios/:id', async (req, res) => {
	const id = req.params.id //pegar o id na requisição

	let conn

	try {
		conn = await getConnection() //cria a conexão com o bacno de dados

		const result = await conn.execute(`DELETE FROM pessoa WHERE id = :1`, [id])

		if (result.rowsAffected === 0) { // se tiver alguma que naõ foi afetada
			res.status(404).send('Registro não encontrado') //então registro não encontrado
		} else {
			await conn.commit() // faço o commit no db
			res.status(200).send('Registro removido com sucesso') //envio a resposta para o frontend
		}
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: err.message })
	} finally {
		if (conn) {
			await conn.close()
		}
	}
}) */
