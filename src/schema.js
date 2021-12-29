const { gql } = require('apollo-server-express');

const typeDefs = gql`
  input CommentPayload{
    name: String
    email: String
    movie_id: String
    text: String
  }
  type Subscription {
    commentCreated(moviesIds: [String]): Comment
  }
  type Query {
    checkUserExist: User
    login(email: String, password: String): User
    findMovies(skip: Int, limit: Int): [Movie]
    findMovieById(id: String): Movie
    getComments(movie_id: String): [Comment]

  }

  type Mutation{
    register(name: String, email: String, password: String): RegisterResult
    createComment(content: CommentPayload): Comment
  }
  type Comment{
    _id: String
    name: String
    email: String
    movie_id: String
    text: String
    date: String
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
    comments:[Comment]
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

type RegisterResult{
    type: String
    message:String
    data: Boolean
  }
    
`;

module.exports = typeDefs;
