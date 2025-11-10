import { web3config } from '../dapp.config'

export interface IndexerTransfer {
  id: string
  db_write_timestamp: string
  from: string
  to: string
  tokenId: string
}

export interface GalleryNFT {
  id: string
  tokenId: string
  originalMinter: string
  currentOwner: string
  mintTimestamp: string
  lastTransferTimestamp?: string
  isCurrentlyOwnedByMinter: boolean
}

export class IndexerService {
  private baseUrl: string

  constructor() {
    this.baseUrl = web3config.indexerApiUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async graphqlQuery<T>(query: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
      }

      return result.data
    } catch (error) {
      console.error('GraphQL query error:', error)
      throw error
    }
  }

  async getMintEvents(): Promise<IndexerTransfer[]> {
    const query = `
      query GetMintEvents {
        Blonks_Transfer(
          where: { from: { _eq: "0x0000000000000000000000000000000000000000" } }
          order_by: { db_write_timestamp: asc }
        ) {
          id
          db_write_timestamp
          from
          to
          tokenId
        }
      }
    `

    const result = await this.graphqlQuery<{
      Blonks_Transfer: IndexerTransfer[]
    }>(query)

    return result.Blonks_Transfer
  }

  async getTransferEvents(): Promise<IndexerTransfer[]> {
    const query = `
      query GetTransferEvents {
        Blonks_Transfer(order_by: { db_write_timestamp: desc }) {
          id
          db_write_timestamp
          from
          to
          tokenId
        }
      }
    `

    const result = await this.graphqlQuery<{
      Blonks_Transfer: IndexerTransfer[]
    }>(query)

    return result.Blonks_Transfer
  }

  async getGalleryData(): Promise<GalleryNFT[]> {
    try {
      // Fetch mint events and transfer events in parallel
      const [mintEvents, transferEvents] = await Promise.all([
        this.getMintEvents(),
        this.getTransferEvents(),
      ])

      // Create a map of the latest transfer for each token
      const latestTransfers = new Map<string, IndexerTransfer>()

      transferEvents.forEach((transfer) => {
        const existing = latestTransfers.get(transfer.tokenId)

        if (
          !existing ||
          new Date(transfer.db_write_timestamp) >
            new Date(existing.db_write_timestamp)
        ) {
          latestTransfers.set(transfer.tokenId, transfer)
        }
      })

      // Process mint events into gallery data
      return mintEvents
        .map((mint) => {
          const latestTransfer = latestTransfers.get(mint.tokenId)
          const isCurrentlyOwnedByMinter =
            !latestTransfer || latestTransfer.to === mint.to

          return {
            id: mint.id,
            tokenId: mint.tokenId,
            originalMinter: mint.to,
            currentOwner: latestTransfer?.to || mint.to,
            mintTimestamp: mint.db_write_timestamp,
            lastTransferTimestamp: latestTransfer?.db_write_timestamp,
            isCurrentlyOwnedByMinter,
          }
        })
        .sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId)) // Sort by token ID
    } catch (error) {
      console.error('Error getting gallery data:', error)
      throw error
    }
  }

  async getNFTByTokenId(tokenId: string): Promise<GalleryNFT | null> {
    const query = `
      query GetNFTByTokenId($tokenId: String!) {
        Blonks_Transfer(
          where: { tokenId: { _eq: $tokenId } }
          order_by: { db_write_timestamp: desc }
          limit: 1
        ) {
          id
          db_write_timestamp
          from
          to
          tokenId
        }
      }
    `

    const result = await this.graphqlQuery<{
      Blonks_Transfer: IndexerTransfer[]
    }>(query, { tokenId })

    if (!result.Blonks_Transfer.length) {
      return null
    }

    const transfer = result.Blonks_Transfer[0]

    return {
      id: transfer.id,
      tokenId: transfer.tokenId,
      originalMinter: transfer.to, // For single transfer, assume it's the minter
      currentOwner: transfer.to,
      mintTimestamp: transfer.db_write_timestamp,
      isCurrentlyOwnedByMinter: true,
    }
  }

  async getTransfersByAddress(address: string): Promise<IndexerTransfer[]> {
    const query = `
      query GetTransfersByAddress($address: String!) {
        Blonks_Transfer(
          where: { _or: [{ from: { _eq: $address } }, { to: { _eq: $address } }] }
          order_by: { db_write_timestamp: desc }
        ) {
          id
          db_write_timestamp
          from
          to
          tokenId
        }
      }
    `

    const result = await this.graphqlQuery<{
      Blonks_Transfer: IndexerTransfer[]
    }>(query, { address })

    return result.Blonks_Transfer
  }
}

export const indexerService = new IndexerService()

