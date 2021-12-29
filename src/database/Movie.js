const db = require("./mongo_db").get_MFLIX_DB
var { ObjectId } = require('mongodb');

module.exports = class Movie {
    async findMovies(skip, limit) {
        //let data = await db().collection('movies').find().skip(skip).limit(limit).toArray()
        let data = await db().collection('movies').aggregate([
            {$sort: {released: -1}},
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: "comments", localField: "_id", foreignField: "movie_id", as:"comments" } }
        ]).toArray()
        // console.log('data')
        // console.log(data)
        return data
    }

    async findMovieById(id) {
        let data = await db().collection('movies').findOne({ _id: new ObjectId(id) })
        return data
    }
}