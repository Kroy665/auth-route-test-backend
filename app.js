const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const { verifyAccessToken } = require('./helpers/jwt_helper')
require('./helpers/init_redis')
var cors = require('cors')

const AuthRoute = require('./Routes/Auth.route')

const app = express()
app.use(cors(), function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://auth-route-test.herokuapp.com/auth"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
})
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', verifyAccessToken, async (req, res, next) => {
  res.send({Authorization: true})
})

app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
