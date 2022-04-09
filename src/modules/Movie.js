const { gql } = require('apollo-server-express');
var MovieClass = require('../models/Movie')
var Movie = new MovieClass()

const typeDefs = gql`
enum CacheControlScope {
  PUBLIC
  PRIVATE
}

directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
  inheritMaxAge: Boolean
) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    type Movie @cacheControl(maxAge: 240, scope: PUBLIC){
        _id: String
        poster: String
        plot: String
        genres: [String]
        runtime: Float
        cast: [String]
        num_mflix_comments: Int
        title: String
        fullplot: String
        countries: [String]
        released: String
        directors: [String]
        rated: String
        awards: Awards
        lastupdated: String
        year: Int
        imdb: IMDB
        type: String
        tomatoes: Tomatoes
        comments:[Comment] @cacheControl(maxAge: 240, scope: PUBLIC)
     }
    type Tomatoes{
        viewer: Viewer,
        lastUpdated: Int
    }
    type Awards{
        wins:Int,
        nominations: Int,
        text: String
    }

    type IMDB{
        rating: Float,
        votes: Float,
        id: Int
    }
    type Viewer{
        rating: Float,
        numReviews: Int,
        meter: Int
    }
    extend type Query{
        findMovies(skip: Int, limit: Int): [Movie] 
        findMovieById(id: String): Movie
    }


`
const resolvers = {
    Query: {
        findMovies: async (_, { skip, limit },__,{ cacheControl }) => {
            cacheControl.setCacheHint({ maxAge: 240, scope: 'PUBLIC' })
            console.log('cacheControl')
            console.log(cacheControl)
            let res = await Movie.findMovies(skip, limit)
            return res
        },
        findMovieById: async (_, { id }) => {
            let res = await Movie.findMovieById(id)
            return res
        },

    },
} 
module.exports = {
    typeDefs,
    resolvers
}