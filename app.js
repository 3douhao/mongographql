// all imports
const express = require('express')
const mongoose = require('mongoose')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList
} = require('graphql')

// DB settings
const url = 'mongodb://localhost/gql'
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.once('open', () => console.log('DB connected Yayayayayaya!!!!!'))
db.on('error', error => console.error('connection error:', error))

const PersonModel = mongoose.model('person', {
  firstName: String,
  lastName: String
})

// GraphQL Settings
const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString }
  }
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryComand',
    fields: {
      people: {
        type: GraphQLList(PersonType),
        resolve: (parent, args, context, info) => {
          return PersonModel.find().exec()
        }
      },
      peoson: {
        type: PersonType,
        args: {
          id: {
            type: GraphQLNonNull(GraphQLID)
          }
        },
        resolve: (parent, args, context, info) => {
          return PersonModel.findById(args.id).exec()
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'MutationInstruction',
    fields: {
      person: {
        type: PersonType,
        args: {
          firstName: { type: GraphQLNonNull(GraphQLString) },
          lastName: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (parent, args, context, info) => {
          const person = new PersonModel(args)
          return person.save()
        }
      }
    }
  })
})

// app settings

const app = express()
app.use(express.json())
app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }))
app.listen(8000, () => console.log('on port 8000'))
