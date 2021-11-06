var jwt = require('jsonwebtoken');
var UserClass = require('./database/User')
var MovieClass = require('./database/Movie')
var User = new UserClass()
var Movie = new MovieClass()
module.exports = {
    Query: {
        login: async (_, { email, password }, { req }) => {
            let res = await User.login(email, password)
            if (res.email) {
                var token = await jwt.sign({ email: res.email }, process.env.JWTSECRETKEY);
                res.token = token
            }
            return res
        },
        findMovies: async (_, {skip, limit}) => {
            let res = await Movie.findMovies(skip, limit)
            return res
        },
        findMovieById: async (_, { id }) => {
            let res = await Movie.findMovieById(id)
            return res
        },
    },
    Mutation: {
        register: async (_, { name, email, password }) => {
            let res = await User.register({ name, email, password })
            return res
        },

    }
};
