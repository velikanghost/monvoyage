import { useEffect, useRef, useState } from 'react'
import { useBlockNumber } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { web3config } from '../dapp.config'
import { blonksAbi } from '../contracts-generated'
import { indexerService, GalleryNFT } from '../services/indexer'
import { monadTestnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(web3config.chainRpcUrl),
})

export function useNFTs() {
  const nftTokenListRef = useRef<GalleryNFT[]>([])
  const currentTokenIndexRef = useRef(0)
  const lastBlockRef = useRef<number | null>(null)

  const [currentTokenId, setCurrentTokenId] = useState<string | null>(null)
  const [nftSvg, setNftSvg] = useState<string | null>(null)

  const { data: blockNumber } = useBlockNumber({ watch: true })

  // Load NFT tokens from indexer
  useEffect(() => {
    const loadNFTTokens = async () => {
      try {
        const galleryData = await indexerService.getGalleryData()
        nftTokenListRef.current = galleryData
        if (galleryData.length > 0) {
          const firstTokenId = galleryData[0].tokenId
          setCurrentTokenId(firstTokenId)
          currentTokenIndexRef.current = 1 % galleryData.length
        }
      } catch (error) {
        console.error('Error loading NFT tokens:', error)
      }
    }

    loadNFTTokens()
  }, [])

  // Watch block numbers and cycle tokens every 100 blocks
  useEffect(() => {
    if (!blockNumber || nftTokenListRef.current.length === 0) return

    const currentBlock = Number(blockNumber)
    const lastBlock = lastBlockRef.current

    if (lastBlock !== null) {
      const lastBlockHundred = Math.floor(lastBlock / 100)
      const currentBlockHundred = Math.floor(currentBlock / 100)

      if (currentBlockHundred > lastBlockHundred) {
        const nextIndex = currentTokenIndexRef.current
        const nextToken =
          nftTokenListRef.current[nextIndex % nftTokenListRef.current.length]
        setCurrentTokenId(nextToken.tokenId)
        currentTokenIndexRef.current =
          (nextIndex + 1) % nftTokenListRef.current.length
      }
    }

    lastBlockRef.current = currentBlock
  }, [blockNumber])

  // Fetch and parse tokenURI for the current token
  useEffect(() => {
    if (!currentTokenId) {
      setNftSvg(null)
      return
    }

    let isCancelled = false

    const fetchTokenURI = async () => {
      try {
        const tokenUri = await publicClient.readContract({
          address: web3config.contractAddress as `0x${string}`,
          abi: blonksAbi,
          functionName: 'tokenURI',
          args: [BigInt(currentTokenId)],
        })

        const base64Data = (tokenUri as string).split(',')[1]
        if (!base64Data) {
          if (!isCancelled) setNftSvg(null)
          return
        }

        const jsonString = atob(base64Data)
        const metadata = JSON.parse(jsonString)

        if (metadata.image) {
          const svgBase64 = metadata.image.split(',')[1]
          if (svgBase64) {
            const svgString = atob(svgBase64)
            if (!isCancelled) {
              setNftSvg(svgString)
            }
            return
          }
        }

        if (!isCancelled) setNftSvg(null)
      } catch (error) {
        console.error(
          `Error fetching tokenURI for token ${currentTokenId}:`,
          error,
        )
        if (!isCancelled) setNftSvg(null)
      }
    }

    setNftSvg(null)
    fetchTokenURI()

    return () => {
      isCancelled = true
    }
  }, [currentTokenId])

  return {
    currentTokenId,
    nftSvg,
  }
}
