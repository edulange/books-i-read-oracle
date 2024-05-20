const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getConnection, oracledb } = require('../database/oracleConnection')
const { existsOrError } = require('./validations')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/usuarios', authMiddleware, async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        console.log('User ID from token:', req.userId);

        const select = `SELECT * FROM USUARIOS WHERE id = :id`;
        const result = await connection.execute(select, [req.userId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        console.log('Query result rows:', result.rows);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.post('/usuarios', async (req, res) => {
	const { name, password } = req.body

	try {
		existsOrError(name, 'O nome não foi informado')
		existsOrError(password, 'O password não foi informado')
	} catch (msg) {
		return res.status(400).send(msg) //aqui eu estarei enviando a mensagem para o usuario na tela.
	}

	let connection

	try {
		connection = await getConnection()

		const result = await connection.execute(
			'INSERT INTO USUARIOS (name, password) values (:1, :2)', //comando para o banco de dados
			[name, password]
		)

		if (result.rowsAffected) {
			//se o conn der certo, ele vai adicionar uma linha, logo
			await connection.commit() //eu quero commitar no oracle isso.

			res.status(201).send('Registro criado com sucesso')
		}
	} catch (error) {
		console.log(error)
		res.status(500).json(error) //enviar para o usuario o erro
	} finally {
		//para finalizar então
		if (connection) {
			await connection.close() //fechar a conexão com o oracle
		}
	}
})

router.put('/usuarios/:id', async (req, res) => {
	//tem q passar via paratro o ID
	const id = req.params.id // eu quero o ID que está nos parametros da minha requisição
	const { name, password } = req.body

	try {
		existsOrError(name, 'O nome não foi informado')
		existsOrError(password, 'O password não foi informado')
	} catch (msg) {
		return res.status(400).send(msg)
	}

	let connection

	try {
		connection = await getConnection() //inicia a coneção

		const result = await connection.execute(
			//executando um update no meu banco de dados
			`UPDATE usuarios SET name = :1, password = :2
             WHERE id = :3`,
			[name, password, id]
		)

		if (result.rowsAffected === 0) {
			//verificando se alguma linha foi afetada
			res.status(404).json({ message: 'Registro não encontrado' })
		} else {
			await connection.commit() //comitar
			res.status(200).json({ message: 'Registro atualizado com sucesso' }) //devolvendo a resposta para o frontend
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

router.delete('/usuarios/:id', async (req, res) => {
	const id = req.params.id //pegar o id na requisição

	let connection

	try {
		connection = await getConnection() //cria a conexão com o bacno de dados

		const result = await connection.execute(`DELETE FROM usuarios WHERE id = :1`, [id])

		if (result.rowsAffected === 0) {
			// se tiver alguma que naõ foi afetada
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

// Endpoint de registro
router.post('/register', async (req, res) => {
	const { name, password } = req.body

	try {
		existsOrError(name, 'O nome não foi informado')
		existsOrError(password, 'O password não foi informado')
	} catch (msg) {
		return res.status(400).send(msg)
	}

	let connection
	try {
		connection = await getConnection() //cria a conexão com o bacno de dados
		const hashedPassword = await bcrypt.hash(password, 10)

		const result = await connection.execute(
			`INSERT INTO USUARIOS (name, password) VALUES (:name, :password)`,
			{ name, password: hashedPassword },
			{ autoCommit: true }
		)

		res.status(201).json({ message: 'Usuário registrado com sucesso!' })
	} catch (error) {
		res.status(500).json({ message: 'Erro ao registrar usuário.', error })
	} finally {
		if (connection) {
			await connection.close()
		}
	}
})

// Endpoint de login
router.post('/login', async (req, res) => {
	const { name, password } = req.body;

	let connection;
	try {
		connection = await getConnection();

		const result = await connection.execute(
			`SELECT * FROM USUARIOS WHERE name = :name`,
			[name],
			{ outFormat: oracledb.OUT_FORMAT_OBJECT } // Isso garante que ele vai retornar um objeto.
		);

		const user = result.rows[0];

		console.log('Resultado da consulta:', user);
		console.log(user)

		if (!user) {
			return res.status(400).json({ message: 'Credenciais inválidas' });
		}

		console.log('Senha fornecida:', password);
		console.log('Senha hash no banco de dados:', user.PASSWORD);

		const isPasswordValid = await bcrypt.compare(password, user.PASSWORD); // Acessando a propriedade PASSWORD
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Password inválido' });
		}

		const token = jwt.sign({ id: user.ID }, process.env.SECRET_KEY, { expiresIn: '1h' }); // Acessando a propriedade ID
		res.status(200).json({ token });
	} catch (error) {
		console.error('Erro no login:', error);
		res.status(500).json({ message: 'Erro ao fazer login.', error });
	} finally {
		if (connection) {
			await connection.close();
		}
	}
});

module.exports = router
