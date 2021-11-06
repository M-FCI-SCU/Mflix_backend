const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    login(email: String, password: String): User
    findMovies(skip: Int, limit: Int): [Movie]
    findMovieById(id: String): Movie

  }

  type Mutation{
    register(name: String, email: String, password: String): RegisterResult
  }

  type User{
    _id: String
    name: String
    password: String
    email: String
    token: String
  }
  type Movie{
    _id: String
    plot: String
    genres: [String]
    runtime: Int
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
  rating: Int,
  votes: Int,
  id: Int
}
type Viewer{
    rating: Float,
    numReviews: Int,
    meter: Int
  }

  type RegisterResult{
    type: String
    message:String
    data: Boolean
  }
    
`;

module.exports = typeDefs;
