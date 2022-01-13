require('dotenv').config()
const cors = require("cors")
var jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require("@graphql-tools/schema")
const { applyMiddleware } = require('graphql-middleware')
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { StartMongodb } = require('./src/database/mongo_db')
const typeDefs = require('./src/schema');
const resolvers = require('./src/resolvers');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const {GraphQLUpload, graphqlUploadExpress} = require('graphql-upload');
const express = require('express');
const http = require('http');


var UserClass = require('./src/database/User')
var User = new UserClass()
var permissions = require("./src/middleware/permissions")

function startExpressServer() {
    const app = express();
    app.use(cors());
    // app.use(session({
    //     secret: 'This is a secret',
    //     cookie: {
    //         maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    //     },
    //     store: store,
    //     resave: false,
    //     saveUninitialized: false
    // }));
    // app.use(async (req, res, next) => {
    //     console.log(req.session)
    //     if (req.session.isAuth) {
    //         let results = await User.findUserByEmail(req.session.email)
    //         console.log('results')
    //         console.log(results)
    //         if (results) {
    //             req.currentUser = results
    //         } else {
    //             req.currentUser = null
    //         }
    //     } else {
    //         req.currentUser = null
    //     }
    //     next()
    // })
    
    //Upload file middleware
    app.use(graphqlUploadExpress());
    //================jsonwebtoken======================
    app.use(async (req, res, next) => {
        if (req.headers.authorization) {
            var decoded = jwt.verify(req.headers.authorization, process.env.JWTSECRETKEY);
            let results = await User.findUserByEmail(decoded.email)
            if (results) {
                req.currentUser = results
            } else {
                req.currentUser = null
            }
        } else {
            req.currentUser = null
        }
        next()
    })
    return app
}

async function startApolloServer(typeDefs, resolvers, app) {
    const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });
    const subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            async onConnect(connectionParams, webSocket, context) {
                console.log('Connected!')
            },
            async onDisconnect(webSocket, context) {
                console.log('Disconnected!')
            }
        },
        { server: httpServer, path: '/graphql' },
    );
    const server = new ApolloServer({
        schema: applyMiddleware(
            schema,
            permissions
        ),

        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), {
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
        context: async ({ req }) => {
            return { req, currentUser: req.currentUser }
        }
    });

    await server.start();

    server.applyMiddleware({ app });

    await new Promise(resolve => httpServer.listen({ port: process.env.PORT || 5000}, resolve));
    console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
}

async function startServers() {
    await StartMongodb()
    let app = startExpressServer()
    startApolloServer(typeDefs, resolvers, app)
}

startServers()

