const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl).then(
  () => {
    logger.info('Connected to database')
  },
  error => {
    logger.error(`Connection error: ${error.stack}`)
  }
)

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app