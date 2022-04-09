const { gql } = require('apollo-server-express');
var jwt = require('jsonwebtoken');
var CommentClass = require('../models/Comment')
var Comment = new CommentClass()
var { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const typeDefs = gql`
  input CommentPayload{
    name: String
    email: String
    movie_id: String
    text: String
  }
  type Comment{
    _id: String
    name: String
    email: String
    movie_id: String
    text: String
    date: String
  }
  type CommentSubscribePayload{
    _id: String
    name: String
    email: String
    movie_id: String
    text: String
    date: String
    action: String
  }
 extend type Subscription {
    CommentsSubscribe(moviesIds: [String]): CommentSubscribePayload
  }
 extend type Query{
    getComments(movie_id: String): [Comment]
    }

 extend type Mutation{
    createComment(content: CommentPayload): Comment
    deleteComment(movieId: String,commentId: String): Comment
 }

`
const resolvers = {
    Subscription: {
        CommentsSubscribe: {
            // More on pubsub below
            subscribe: withFilter(
                () => pubsub.asyncIterator('COMMENT_SUBSCRIBE'),
                (payload, variables) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    let index = variables.moviesIds.findIndex(movieid => movieid == payload.CommentsSubscribe.movie_id)
                    console.log('index')
                    console.log(index)
                    return index != -1 ? true : false;
                },
            ),

        },
    },
    Mutation: {
        createComment: async (_, { content }) => {
            let { name, email, movie_id, text } = content
            let res = await Comment.createComment({ name, email, movie_id, text })

            if (res._id) {
                pubsub.publish('COMMENT_SUBSCRIBE', { CommentsSubscribe: { ...res, action: "COMMENT_CREATED" } });
            }
            return res
        },
        deleteComment: async (_, { movieId, commentId }) => {
            let res = await Comment.deleteComment(movieId, commentId)
            console.log("COMMENT_DELETED==========================================")
            if (res._id) {
                console.log({ ...res, action: "COMMENT_DELETED" })
                pubsub.publish('COMMENT_SUBSCRIBE', { CommentsSubscribe: { ...res, action: "COMMENT_DELETED" } });
            }
            return res
        },
    }
} 

module.exports = {
    typeDefs,
    resolvers
}