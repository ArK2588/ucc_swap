"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { Balance } from "~~/components/scaffold-eth";
import { useCoinGeckoPrice } from "~~/hooks/useCoinGeckoPrice";
import { useSpotPrice } from "~~/hooks/useSpotPrice";

const SwapBox = () => {
  const [fromToken, setFromToken] = useState({
    amount: "",
    symbol: "ETH",
    chain: "Ethereum",
  });

  const [toToken, setToToken] = useState({
    amount: "",
    symbol: "TRX",
    chain: "Tron",
  });

  const [isClient, setIsClient] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const { address: connectedAddress } = useAccount();

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address: connectedAddress,
  });

  // Get real-time ETH price from 1inch API
  const {
    loading: priceLoading,
    error: priceError,
    usdValue,
    price: ethPrice,
  } = useSpotPrice(fromToken.symbol, fromToken.chain.toLowerCase(), fromToken.amount);

  // Get TRON price from CoinGecko for cross-chain calculation
  const { tronPrice, loading: coinGeckoLoading, error: coinGeckoError, calculateTronAmount } = useCoinGeckoPrice();

  // Check if current network supports 1inch Spot Price API
  const supportedNetworks = [
    "ethereum",
    "arbitrum",
    "avalanche",
    "bnb",
    "gnosis",
    "solana",
    "sonic",
    "optimism",
    "polygon",
    "zksync",
    "base",
    "linea",
    "unichain",
  ];
  const isNetworkSupported = supportedNetworks.includes(fromToken.chain.toLowerCase());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update TRON amount when ETH price changes or when fromToken.amount changes
  useEffect(() => {
    // Only proceed if we have all required values and we're in the correct token pair
    if (fromToken.symbol === "ETH" && toToken.symbol === "TRX" && fromToken.amount && ethPrice && !priceLoading) {
      console.log("Recalculating TRON amount due to ETH price change:", { ethPrice, amount: fromToken.amount });
      const tronAmount = calculateTronAmount(fromToken.amount, ethPrice);

      // Only update if the amount has actually changed
      setToToken(prev => {
        if (prev.amount === tronAmount) return prev;
        return {
          ...prev,
          amount: tronAmount,
        };
      });
    }
  }, [ethPrice, fromToken.amount, fromToken.symbol, toToken.symbol, priceLoading, calculateTronAmount]);

  // Input validation functions
  const validateNumberInput = (value: string): string => {
    // Allow empty string, numbers, and single decimal point
    const regex = /^$|^\d*\.?\d*$/;
    if (!regex.test(value)) {
      return fromToken.amount; // Return previous valid value
    }
    return value;
  };

  const checkInsufficientFunds = (amount: string): void => {
    if (!amount || !balance || parseFloat(amount) <= 0) {
      setInputError(null);
      return;
    }

    const inputAmount = parseFloat(amount);
    const balanceInEth = parseFloat(formatEther(balance.value));

    if (inputAmount > balanceInEth) {
      setInputError("Insufficient funds");
    } else {
      setInputError(null);
    }
  };

  const handleAmountChange = (value: string) => {
    const validatedValue = validateNumberInput(value);
    setFromToken(prev => ({
      ...prev,
      amount: validatedValue,
    }));
    checkInsufficientFunds(validatedValue);

    console.log("handleAmountChange:", {
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      validatedValue,
      ethPrice,
      tronPrice,
    });

    // Clear TRX amount if input is empty
    if (!validatedValue) {
      setToToken(prev => ({
        ...prev,
        amount: "",
      }));
    }
  };

  const handleFromTokenChange = (symbol: string, chain: string) => {
    setFromToken({ ...fromToken, symbol, chain });
    // Recalculate if switching to ETH with TRX target
    if (symbol === "ETH" && toToken.symbol === "TRX" && fromToken.amount && ethPrice) {
      const tronAmount = calculateTronAmount(fromToken.amount, ethPrice);
      setToToken({ ...toToken, amount: tronAmount });
    }
  };

  const handleToTokenChange = (symbol: string) => {
    setToToken({ ...toToken, symbol });
    // Recalculate if switching to TRX with ETH source
    if (fromToken.symbol === "ETH" && symbol === "TRX" && fromToken.amount && ethPrice) {
      const tronAmount = calculateTronAmount(fromToken.amount, ethPrice);
      setToToken({ ...toToken, symbol, amount: tronAmount });
    } else {
      setToToken({ ...toToken, symbol, amount: "" });
    }
  };

  const handleSwap = () => {
    if (inputError) {
      return; // Don't allow swap if there's an error
    }
    // Will implement swap logic later
    console.log("Initiating swap:", { fromToken, toToken });
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-2xl overflow-hidden">
        <div className="card-body p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Cross-Chain Swap</h2>

          {/* From Token */}
          <div className="bg-base-200 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">You pay</span>
              <div className="flex items-center">
                <span className="text-sm font-medium">Balance: </span>
                <Balance address={connectedAddress} className="ml-1" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="0.0"
                  className={`input input-ghost w-full text-2xl font-semibold p-0 focus:outline-none ${
                    inputError ? "text-error" : ""
                  }`}
                  value={fromToken.amount}
                  onChange={e => handleAmountChange(e.target.value)}
                  onKeyPress={e => {
                    // Allow only numbers, decimal point, and control keys
                    if (!/[0-9.]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                      e.preventDefault();
                    }
                  }}
                />
                {priceLoading && fromToken.amount && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2">
                    <span className="loading loading-spinner loading-xs"></span>
                  </span>
                )}
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                  {fromToken.symbol} ▼
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={() => handleFromTokenChange("ETH", "Ethereum")}>ETH (Ethereum)</button>
                  </li>
                  <li>
                    <button onClick={() => handleFromTokenChange("USDT", "Ethereum")}>USDT (Ethereum)</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">{fromToken.chain}</span>
              <div className="flex items-center">
                {priceLoading && fromToken.amount && parseFloat(fromToken.amount) > 0 ? (
                  <span className="flex items-center text-sm text-gray-500">
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Fetching price...
                  </span>
                ) : priceError ? (
                  <span className="text-error text-sm">Price unavailable</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {isNetworkSupported && fromToken.symbol === "ETH" ? (
                      usdValue ? (
                        `~$${usdValue}`
                      ) : (
                        "~$0.00"
                      )
                    ) : fromToken.chain === "Tron" ? (
                      <span className="text-warning">Tron price coming soon</span>
                    ) : (
                      "~$0.00"
                    )}
                  </span>
                )}
              </div>
            </div>
            {inputError && (
              <div className="mt-2">
                <span className="text-error text-sm font-medium">{inputError}</span>
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center my-2">
            <button className="btn btn-circle btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M15.707 4.293a1 1 0 010 1.414L9.414 12l6.293 6.293a1 1 0 01-1.414 1.414l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="bg-base-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">You receive</span>
              {coinGeckoLoading && fromToken.amount && fromToken.symbol === "ETH" && toToken.symbol === "TRX" && (
                <span className="text-xs text-gray-400 flex items-center">
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                  Calculating...
                </span>
              )}
            </div>
            <div className="flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-ghost w-full text-2xl font-semibold p-0 focus:outline-none"
                  value={toToken.amount}
                  onChange={e => setToToken({ ...toToken, amount: e.target.value })}
                  readOnly={fromToken.symbol === "ETH" && toToken.symbol === "TRX"}
                />
                {coinGeckoLoading && fromToken.amount && fromToken.symbol === "ETH" && toToken.symbol === "TRX" && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2">
                    <span className="loading loading-spinner loading-xs"></span>
                  </span>
                )}
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                  {toToken.symbol} ▼
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={() => handleToTokenChange("USDT")}>USDT</button>
                  </li>
                  <li>
                    <button onClick={() => handleToTokenChange("TRX")}>TRX</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">{toToken.chain}</span>
              <div className="flex items-center">
                {coinGeckoLoading && fromToken.symbol === "ETH" && toToken.symbol === "TRX" && fromToken.amount ? (
                  <span className="flex items-center text-sm text-gray-500">
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Fetching price...
                  </span>
                ) : coinGeckoError ? (
                  <span className="text-error text-sm">Price unavailable</span>
                ) : toToken.symbol === "TRX" && tronPrice && toToken.amount ? (
                  <span className="text-sm text-gray-500">~${(parseFloat(toToken.amount) * tronPrice).toFixed(2)}</span>
                ) : (
                  <span className="text-sm text-gray-500">~$0.00</span>
                )}
              </div>
            </div>
          </div>

          {/* Connect/Approve/Swap Button */}
          {!connectedAddress ? (
            <button className="btn btn-primary w-full">Connect Wallet</button>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={handleSwap}
              disabled={!fromToken.amount || !toToken.amount || !!inputError}
            >
              {inputError ? "Insufficient Funds" : "Swap"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapBox;
