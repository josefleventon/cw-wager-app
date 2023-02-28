import { gql } from '@apollo/client'
import { COLLECTION_ADDRESS } from 'util/constants'
import { client, NFT } from '.'

export const getInventory = async (address: string) => {
  const { data } = await client.query({
    query: gql`
      query Inventory(
        $limit: Int
        $owner: String
        $filterByCollectionAddrs: [String!]
      ) {
        tokens(
          owner: $owner
          limit: $limit
          filterByCollectionAddrs: $filterByCollectionAddrs
        ) {
          tokens {
            tokenId
            name
            media {
              image(size: LG) {
                jpgLink
              }
            }
            traits {
              name
              value
            }
          }
        }
      }
    `,
    variables: {
      owner: address,
      filterByCollectionAddrs: [COLLECTION_ADDRESS],
      limit: 1000,
    },
  })

  return data.tokens.tokens as NFT[]
}

export const getToken = async (tokenId: string) => {
  const { data } = await client.query({
    query: gql`
      query Token($collectionAddr: String!, $tokenId: String!) {
        token(collectionAddr: $collectionAddr, tokenId: $tokenId) {
          tokenId
          name
          media {
            image(size: LG) {
              jpgLink
            }
          }
          traits {
            name
            value
          }
        }
      }
    `,
    variables: { collectionAddr: COLLECTION_ADDRESS, tokenId },
  })

  return data.token as NFT
}
