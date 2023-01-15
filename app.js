require('dotenv').config()
const {MONGO_URI, PORT} = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

console.log('connecting to', MONGO_URI)

mongoose.connect(MONGO_URI)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((error) => {
		console.log('error connecting to MongoDB:', error.message)
	})

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app;