const express = require('express')
const router = express.Router()
const AuthController = require('../Controllers/Auth.Controller')
const {verifyAccessToken} = require('../helpers/jwt_helper')

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.post('/refresh-token', AuthController.refreshToken)

router.post('/user-data',verifyAccessToken, AuthController.userData)

router.delete('/logout/:refreshToken', AuthController.logout)

module.exports = router
