const createError = require('http-errors')
const User = require('../Models/User.model')
const { authSchema,loginSchema } = require('../helpers/validation_schema')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken
} = require('../helpers/jwt_helper')
const client = require('../helpers/init_redis')

module.exports = {
  register: async (req, res, next) => {
    try {
      // const { email, password } = req.body
      // if (!email || !password) throw createError.BadRequest()
      const result = await authSchema.validateAsync(req.body)

      const doesExist = await User.findOne({ email: result.email })
      if (doesExist)
        throw createError.Conflict(`${result.email} is already been registered`)

      const user = new User(result)
      const savedUser = await user.save()
      const accessToken = await signAccessToken(savedUser.id)
      const refreshToken = await signRefreshToken(savedUser.id)

      res.send({ accessToken, refreshToken })
    } catch (error) {
      if (error.isJoi === true) error.status = 422
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await loginSchema.validateAsync(req.body)
      const user = await User.findOne({ email: result.email })
      if (!user) throw createError.NotFound('User not registered')

      const isMatch = await user.isValidPassword(result.password)
      if (!isMatch)
        throw createError.Unauthorized('Username/password not valid')

      const accessToken = await signAccessToken(user.id)
      const refreshToken = await signRefreshToken(user.id)

      res.send({ accessToken, refreshToken })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid Username/Password'))
      next(error)
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body
      // console.log(refreshToken)
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)

      const accessToken = await signAccessToken(userId)
      const refToken = await signRefreshToken(userId)
      res.send({ accessToken: accessToken, refreshToken: refToken })
    } catch (error) {
      next(error)
    }
  },
  userData: async(req, res, next)=>{
    try {
      const {refreshToken} = req.body
      if(!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken) 
      
      const data = await User.findById(userId)
      // console.log(data)
      const outData = {
        Authorization: true,
        name: data.userName,
        email: data.email,
        password: data.password,
      }
      res.send(outData);
    } catch (error) {
      next(error)
    }
  },

  logout: async (req, res, next) => {
    try {
      // const { refreshToken } = req.body
      const refreshToken = req.params.refreshToken
      console.log(req.params.refreshToken)
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message)
          throw createError.InternalServerError()
        }
        console.log(val)
        res.sendStatus(204)
      })
    } catch (error) {
      next(error)
    }
  },
}