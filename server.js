const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const dotEnv = require('dotenv')
const Dataloader = require('dataloader')

const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const { connection } = require('./database/util')
const { verifyUser } = require('./helper/context')
const loaders = require('./loaders')

dotEnv.config()

const app = express()

connection()

app.use(cors())

app.use(express.json())

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    let contextObj = {}
    if (req) {
      await verifyUser(req)
      contextObj.email = req.email
      contextObj.loggedInUserId = req.loggedInUserId
    }
    contextObj.loaders = {
      user: new Dataloader(keys => loaders.user.batchUsers(keys)),
      task: new Dataloader(keys => loaders.task.batchTasks(keys)),
    }

    return contextObj
  },
  formatError: error => {
    return { message: error.message, code: error.extensions.code }
  },
})

apolloServer.applyMiddleware({ app, path: '/graphql' })

const PORT = process.env.PORT || 3001

const httpServer = app.listen(PORT, () => {
  console.log(`🚀 App running on port: ${PORT}`)
  console.log(`GraphQL endpoint: ${apolloServer.graphqlPath}`)
})

apolloServer.installSubscriptionHandlers(httpServer)
