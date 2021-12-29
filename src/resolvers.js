var jwt = require('jsonwebtoken');
var UserClass = require('./database/User')
var MovieClass = require('./database/Movie')
var CommentClass = require('./database/Comment')
var User = new UserClass()
var Movie = new MovieClass()
var Comment = new CommentClass()
var { ObjectId } = require('mongodb');
var { PubSub, withFilter } = require('graphql-subscriptions');

const pubsub = new PubSub();
module.exports = {
    Subscription: {
        commentCreated: {
            // More on pubsub below
            subscribe: withFilter(
                () => pubsub.asyncIterator('COMMENT_CREATED'),
                (payload, variables) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                   let index = variables.moviesIds.findIndex(movieid=> movieid==payload.commentCreated.movie_id)
                    return  index != -1 ? true: false;
                },
            ),

        },
    },
    Query: {
        checkUserExist: async (_, __, { req }) => {
            var decoded = jwt.verify(req.headers.authorization, process.env.JWTSECRETKEY);
            let results = await User.findUserByEmail(decoded.email)
            if (results) {
                return results
            } else {
                return null
            }
        },
        login: async (_, { email, password }, { req }) => {
            let res = await User.login(email, password)
            if (res.email) {
                var token = await jwt.sign({ email: res.email }, process.env.JWTSECRETKEY);
                res.token = token
            }
            return res
        },
        findMovies: async (_, { skip, limit }) => {
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
        createComment: async (_, { content }) => {
            console.log('content')
            console.log(content)
            let { name, email, movie_id, text } = content
            let res = await Comment.createComment({ name, email, movie_id, text })
            if (res._id) {
                pubsub.publish('COMMENT_CREATED', { commentCreated: res });
            }
            return res
        },

    },
    // Movie: {
    //     comments(parent) {
    //         console.log('parent')
    //         console.log(parent)
    //         return [...parent.comments]
    //     }
    // }
};
