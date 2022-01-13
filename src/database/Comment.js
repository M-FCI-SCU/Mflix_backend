const db = require("./mongo_db").get_MFLIX_DB
var { ObjectId } = require('mongodb');

module.exports = class Comments {
    async getComments(skip, limit) {
        console.log('skip, limit')
        console.log(skip, limit)
        let data = await db().collection('comments').find().skip(skip).limit(limit).toArray()
        return data
    }

    async getCommentsById(id) {
        let data = await db().collection('comments').findOne({ _id: new ObjectId(id) })
        return data
    }
    async createComment({ name, email, movie_id, text }) {
        let payload = {
            name,
            email,
            movie_id: new ObjectId(movie_id),
            text,
            date: new Date()
        }
        let data = await db().collection('comments').insertOne(payload)
        return { _id: data.insertedId, ...payload }
    }

    async deleteComment(movieId, commentId) {
        await db().collection('comments').deleteOne({ _id: new ObjectId(commentId) })
        return { movie_id: movieId, _id: commentId }
    }
}