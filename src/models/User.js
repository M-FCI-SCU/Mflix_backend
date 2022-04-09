const db = require("./mongo_db").get_MFLIX_DB
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = class User {
    constructor() { }
    async register({ name, email, password }) {
        try {
            password = await bcrypt.hash(password, saltRounds)
            if (name && email && password) {
                let res = await db().collection('users').insertOne({ name, email, password })
                return {
                    type: 'success',
                    message: "register successfuly",
                    data: true
                }
            } else {
                return {
                    type: 'faild',
                    message: "something go wrong please make sure you enter valid info!",
                    data: false
                }
            }
        } catch (error) {
            console.log("register error")
            console.log(error)
            return {
                type: 'faild',
                message: "something go wrong please make sure you enter valid info!",
                data: false
            }
        }
    }
    async login(email, password) {
        try {
            console.log('email')
            console.log(email)
            let res = await db().collection('users').findOne({ email: email })
            if (res) {
                const match = await bcrypt.compare(password, res.password)
                if (match) {
                    return res
                }
            }
            throw new Error('Email or password are wrong!');

        } catch (error) {
            console.log(error)
            return error
        }
    }
    async findUserByEmail(email) {
        try {
            let res = await db().collection('users').findOne({ email: email })
            return res
        } catch (error) {
            console.log(error)
        }
    }
    async findUserById(id) {
        try {
            let res = await db().collection('users').findOne({ _id: id })
            return res
        } catch (error) {
            console.log(error)
        }
    }
}