import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { useOrbis } from "@orbisclub/components";
import { useDidToAddress } from "../hooks/useDidToAddress";
import { FaEthereum } from 'react-icons/fa';
import { parseEther, parseUnits } from 'viem';
import { mainnet, polygon, optimism, arbitrum, base, bsc, celo, scroll, linea, zkSync, mode, mantle, gnosis } from 'wagmi/chains';

// Define supported chains
const supportedChains = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  celo,
  scroll,
  linea,
  zkSync,
  mode,
  mantle,
  gnosis
];

// Add chain icons
const chainIcons = {
  [mainnet.id]: '/chain-icons/ethereum.svg',
  [polygon.id]: '/chain-icons/polygon.svg', 
  [optimism.id]: '/chain-icons/optimism.svg',
  [arbitrum.id]: '/chain-icons/arbitrum.svg',
  [base.id]: '/chain-icons/base.svg',
  [bsc.id]: '/chain-icons/bsc.svg',
  [celo.id]: '/chain-icons/celo.svg',
  [scroll.id]: '/chain-icons/scroll.svg',
  [linea.id]: '/chain-icons/linea.svg',
  [zkSync.id]: '/chain-icons/zksync.svg',
  [mode.id]: '/chain-icons/mode.svg',
  [mantle.id]: '/chain-icons/mantle.svg',
  [gnosis.id]: '/chain-icons/gnosis.svg'
};

// Token configurations for each chain
const TOKENS = {
  [mainnet.id]: {
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  },
  [polygon.id]: {
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
  },
  // Add token configurations for other chains as needed
};

// ERC20 ABI for token interactions
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  }
];

async function updateUserPoints(orbis, did, points) {
  try {
    const { data: profile } = await orbis.getProfile(did);
    const currentPoints = profile?.details?.metadata?.points || 0;
    const newPoints = currentPoints + points;

    const res = await orbis.updateProfile({
      ...profile?.details?.profile,
      metadata: {
        ...profile?.details?.metadata,
        points: newPoints
      }
    });

    return res.status === 200;
  } catch (error) {
    console.error('Error updating points:', error);
    return false;
  }
}

export default function DonateButton({ post }) {
  const { orbis } = useOrbis();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { address: recipientAddress } = useDidToAddress(post.creator_details?.did);
  
  const [showModal, setShowModal] = useState(false);
  const [showAllChains, setShowAllChains] = useState(false);
  const [selectedChain, setSelectedChain] = useState(mainnet.id);
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Fix displayedChains to properly handle show more
  const displayedChains = showAllChains ? supportedChains : supportedChains.slice(0, 6);

  useEffect(() => {
    if (chainId && supportedChains.some(chain => chain.id === chainId)) {
      setSelectedChain(chainId);
    }
  }, [chainId]);

  const resetForm = () => {
    setAmount('');
    setError('');
    setIsProcessing(false);
  };

  const closeModal = () => {
    if (!isProcessing) {
      setShowModal(false);
      resetForm();
    }
  };

  // Add click handler to prevent event bubbling
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleDonate = async () => {
    console.log('Checking wallet connection...');
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
  
    console.log('Checking Orbis authentication...');
    const { data: user, error: orbisError } = await orbis.isConnected();
    console.log('Orbis user:', user);
    console.log('Orbis error:', orbisError);
  
    if (!user || !user.did || orbisError) {
      console.log('User not authenticated, attempting to connect...');
      const authRes = await orbis.connect();
      console.log('Orbis connect response:', authRes);
  
      if (authRes.status !== 200) {
        setError('Failed to authenticate with Orbis');
        return;
      }
    }

    
    setError('');
    setIsProcessing(true);
  
    try {
      // Get user information from Orbis
      const { data: user } = await orbis.isConnected();
      if (!user || !user.did) {
        throw new Error('User is not authenticated.');
      }
  
      // Switch chain if needed
      if (chainId !== selectedChain) {
        await switchChain({ chainId: selectedChain });
      }
  
      let tx;
      if (selectedToken === 'ETH') {
        tx = await walletClient.sendTransaction({
          to: recipientAddress,
          value: parseEther(amount)
        });
      } else {
        const token = TOKENS[selectedChain][selectedToken];
        if (!token) throw new Error('Token not supported on selected chain');
  
        await writeContractAsync({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [recipientAddress, parseUnits(amount, token.decimals)]
        });
  
        tx = await writeContractAsync({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipientAddress, parseUnits(amount, token.decimals)]
        });
      }
  
      if (tx) {
        await orbis.createPost({
          context: post.stream_id,
          body: `Donated ${amount} ${selectedToken}`,
          data: {
            type: 'donation',
            amount,
            token: selectedToken,
            chain: selectedChain,
            transaction: tx
          }
        });
  
        // Award points to donor
        await updateUserPoints(orbis, user.did, POINTS_RULES.ENGAGE_DONATION);
        
        // Award points to recipient
        if (post.creator_details?.did) {
          await updateUserPoints(orbis, post.creator_details.did, POINTS_RULES.RECEIVE_DONATION);
        }
  
        closeModal();
        alert('Thank you for your donation!');
      }
    } catch (error) {
      console.error('Donation failed:', error);
      setError(error.message || 'Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  

  const getAvailableTokens = (chainId) => {
    const tokens = ['ETH'];
    if (TOKENS[chainId]) {
      tokens.push(...Object.keys(TOKENS[chainId]));
    }
    return tokens;
  };

  return (
    <>
      {address?.toLowerCase() !== recipientAddress?.toLowerCase() ? (
        <button
          onClick={handleButtonClick}
          className="inline-flex items-center px-3 py-1.5 bg-[var(--brand-color)] text-white rounded-full hover:bg-[var(--brand-color-hover)] text-sm"
        >
          <FaEthereum className="mr-1 h-4 w-4" />
          Donate
        </button>
      ) : null}

      {showModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative bg-white rounded-xl max-w-sm w-full shadow-xl transform transition-all">
            {/* Close button */}
            <button
              onClick={closeModal}
              disabled={isProcessing}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-500 p-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-4">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Support this Project</h2>
                <p className="text-xs text-gray-500">Your donation helps support public goods</p>
              </div>

              {/* Chain Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium text-gray-700">Network</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {displayedChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id)}
                      className={`flex items-center justify-center p-2 rounded-lg border text-xs ${
                        selectedChain === chain.id
                          ? 'border-[var(--brand-color)] bg-[var(--brand-color)]/5 text-[var(--brand-color)]'
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="w-4 h-4 mr-1.5">
                        {chain.id === mainnet.id ? (
                          <FaEthereum className="w-full h-full" />
                        ) : (
                          <img 
                            src={chainIcons[chain.id] || '/chain-icons/default.svg'} 
                            alt={chain.name}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <span className="truncate">{chain.name}</span>
                    </button>
                  ))}
                </div>
                {supportedChains.length > 6 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllChains(!showAllChains);
                    }}
                    className="w-full mt-2 px-4 py-2 text-xs text-[var(--brand-color)] hover:bg-[var(--brand-color)]/5 rounded-lg transition-colors"
                  >
                    {showAllChains ? '← Show Less Networks' : 'Show More Networks →'}
                  </button>
                )}
              </div>

              {/* Token Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium text-gray-700">Token</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {getAvailableTokens(selectedChain).map((token) => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      className={`flex items-center justify-center p-2 rounded-lg border text-xs ${
                        selectedToken === token
                          ? 'border-[var(--brand-color)] bg-[var(--brand-color)]/5 text-[var(--brand-color)]'
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium text-gray-700">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.000001"
                    disabled={isProcessing}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-sm text-gray-500">{selectedToken}</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Donate Button */}
              <button
                onClick={handleDonate}
                disabled={!isConnected || parseFloat(amount) <= 0 || isProcessing}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-[var(--brand-color)] text-white rounded-lg hover:bg-[var(--brand-color-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaEthereum className="h-4 w-4 mr-2" />
                    <span>Donate {amount || '0'} {selectedToken}</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-center text-gray-500">
                Transaction fees will be calculated based on the selected network
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}