import { createConfig, http } from 'wagmi'
import { monadTestnet } from 'viem/chains'
import { web3config } from '../dapp.config'

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(web3config.chainRpcUrl),
  },
})
