import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Blonks
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const blonksAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_SUPPLY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINT_PRICE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'hasAddressMinted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'hasMinted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'originalMinter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__
 */
export const useReadBlonks = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"MAX_SUPPLY"`
 */
export const useReadBlonksMaxSupply = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'MAX_SUPPLY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"MINT_PRICE"`
 */
export const useReadBlonksMintPrice = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'MINT_PRICE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBlonksBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadBlonksGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"hasAddressMinted"`
 */
export const useReadBlonksHasAddressMinted =
  /*#__PURE__*/ createUseReadContract({
    abi: blonksAbi,
    functionName: 'hasAddressMinted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"hasMinted"`
 */
export const useReadBlonksHasMinted = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'hasMinted',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadBlonksIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: blonksAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"name"`
 */
export const useReadBlonksName = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"originalMinter"`
 */
export const useReadBlonksOriginalMinter = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'originalMinter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"owner"`
 */
export const useReadBlonksOwner = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadBlonksOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadBlonksSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: blonksAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadBlonksSymbol = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadBlonksTokenByIndex = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'tokenByIndex',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadBlonksTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: blonksAbi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadBlonksTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"tokensOfOwner"`
 */
export const useReadBlonksTokensOfOwner = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'tokensOfOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBlonksTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: blonksAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__
 */
export const useWriteBlonks = /*#__PURE__*/ createUseWriteContract({
  abi: blonksAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteBlonksApprove = /*#__PURE__*/ createUseWriteContract({
  abi: blonksAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteBlonksMint = /*#__PURE__*/ createUseWriteContract({
  abi: blonksAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBlonksRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: blonksAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteBlonksSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: blonksAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteBlonksSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: blonksAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBlonksTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: blonksAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBlonksTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: blonksAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteBlonksWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: blonksAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__
 */
export const useSimulateBlonks = /*#__PURE__*/ createUseSimulateContract({
  abi: blonksAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBlonksApprove = /*#__PURE__*/ createUseSimulateContract(
  { abi: blonksAbi, functionName: 'approve' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBlonksMint = /*#__PURE__*/ createUseSimulateContract({
  abi: blonksAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBlonksRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateBlonksSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateBlonksSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBlonksTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBlonksTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link blonksAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateBlonksWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: blonksAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link blonksAbi}__
 */
export const useWatchBlonksEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: blonksAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link blonksAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBlonksApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: blonksAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link blonksAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchBlonksApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: blonksAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link blonksAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBlonksOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: blonksAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link blonksAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBlonksTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: blonksAbi,
    eventName: 'Transfer',
  })
