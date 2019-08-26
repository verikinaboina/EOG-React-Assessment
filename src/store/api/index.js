import { ApolloClient } from 'apollo-client'
import { getMainDefinition } from 'apollo-utilities'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import { split } from 'apollo-link'

const URL = 'https://react.eogresources.com/graphql'

const httpLink = new HttpLink({
    uri: URL,
})

const wsLink = new WebSocketLink({
    uri: `ws://react.eogresources.com/graphql`,
    options: {
        reconnect: true,
    },
})

const link = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    httpLink
)

const cache = new InMemoryCache()

const client = new ApolloClient({
    cache,
    link,
})

const subscribeLive = async () => await client.subscribe({
    query: gql`
        subscription {
            newMeasurement {
                at
                metric
                value
                unit
            }
        }
    `,
})

const FetchLast30mints = async metric => {
    const last30mints = new Date(new Date().getTime() - 30 * 60000).getTime()
    return await client.query({
        query: gql`
      {
        getMeasurements(
          input: {
            metricName: "${metric}"
            after: ${last30mints}
          }
        ) {
          at
          metric
          value
          unit
        }
      }
    `,
    })
}

export default { client, subscribeLive, FetchLast30mints }
