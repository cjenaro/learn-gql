const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const cors = require('cors')
const dotEnv = require('dotenv')

const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const { connection } = require('./database/util')

dotEnv.config()

const app = express()

connection()

app.use(cors())

app.use(express.json())


const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
})

apolloServer.applyMiddleware({ app, path: '/graphql' })

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 App running on port: ${PORT}`)
  console.log(`GraphQL endpoint: ${apolloServer.graphqlPath}`)
})