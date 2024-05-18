const express = require('express')
const cors = require('cors')
const usersRoutes = require('./api/usersRoutes')
const booksRoutes = require('./api/booksRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', usersRoutes)

app.listen(3001, () => {
    console.log('serviço rodando na porta 3001')
})
//minha aplicação vai escutar na posta 3001



