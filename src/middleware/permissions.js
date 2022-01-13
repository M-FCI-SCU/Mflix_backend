let { rule, shield, and, or } = require("graphql-shield")
const db = require("../database/mongo_db").get_MFLIX_DB
var { ObjectId } = require('mongodb');

const isAuthenticated = rule()((parent, args, { currentUser }) => {
    // console.log('currentUser')
    // console.log(currentUser)
    return currentUser != null
})

const isAuthorizedToComment = rule()(async(parent, {commentId}, { currentUser }) => {
    // console.log('commentId')
    // console.log(commentId)
    let data = await db().collection('comments').findOne({ _id: new ObjectId(commentId) })
    // console.log('data')
    // console.log(data)
    if(data.email == currentUser.email){
        return true
    }else{
        return false
    }
}) 


module.exports = shield({
    Query: {
        // findMovies: isAuthenticated,
        findMovieById: isAuthenticated
    },
    Mutation: {
        createComment: isAuthenticated,
        deleteComment: and(isAuthenticated, isAuthorizedToComment),
    }
})