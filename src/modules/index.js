const { gql } = require('apollo-server-express');
const {typeDefs : userSchema, resolvers : userResolver} = require("./User")
const {typeDefs : movieSchema, resolvers : movieResolver} = require("./Movie")
const {typeDefs : commentSchema, resolvers : commentResolver} = require("./Comment")
const root = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String
  }

  type Query {
    createSnapshots: Boolean
  }

  type Mutation{
    singleUpload(files: [Upload]): File
  }
  type Subscription{
    _:String
  }
    
`;
const typeDefs = [root, userSchema, movieSchema, commentSchema]
const resolvers = [userResolver, movieResolver, commentResolver]
module.exports = {
    typeDefs,
    resolvers
}
    
