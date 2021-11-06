const db = require("./mongo_db").get_MFLIX_DB
var {ObjectId} = require('mongodb');

module.exports = class Movie {
    async findMovies(skip, limit) {
        console.log('skip, limit')
        console.log(skip, limit)
        let data = await db().collection('movies').find().skip(skip).limit(limit).toArray()
        console.log('data')
        console.log(data)
        return data
    }

    async findMovieById(id){
        let data = await db().collection('movies').findOne({_id: new ObjectId(id) })
        return data
    }
}