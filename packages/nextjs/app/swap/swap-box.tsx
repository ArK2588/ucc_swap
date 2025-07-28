"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { Balance } from "~~/components/scaffold-eth";
import { useSpotPrice } from "~~/hooks/useSpotPrice";
import { useTokenPrice } from "~~/hooks/useTokenPrice";

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

  // Get price from 1inch API when ETH is in input field
  const {
    loading: ethPriceLoading,
    error: ethPriceError,
    price: ethPriceFrom1inch,
  } = useSpotPrice(
    fromToken.symbol === "ETH" ? fromToken.symbol : "ETH",
    fromToken.symbol === "ETH" ? fromToken.chain.toLowerCase() : "ethereum",
    fromToken.symbol === "ETH" ? fromToken.amount : "1",
  );

  // Get TRON price from CoinGecko (always needed for calculations)
  const { price: tronPriceFromCoinGecko, loading: tronPriceLoading, error: tronPriceError } = useTokenPrice("TRX");

  // Get ETH price from CoinGecko (needed when TRON is input)
  const { price: ethPriceFromCoinGecko, loading: ethCoinGeckoLoading, error: ethCoinGeckoError } = useTokenPrice("ETH");

  // Determine which prices to use based on input token
  const inputPrice = fromToken.symbol === "ETH" ? ethPriceFrom1inch : tronPriceFromCoinGecko;
  const outputPrice = toToken.symbol === "ETH" ? ethPriceFromCoinGecko : tronPriceFromCoinGecko;
  const inputPriceLoading = fromToken.symbol === "ETH" ? ethPriceLoading : tronPriceLoading;
  const inputPriceError = fromToken.symbol === "ETH" ? ethPriceError : tronPriceError;
  const outputPriceLoading = toToken.symbol === "ETH" ? ethCoinGeckoLoading : tronPriceLoading;
  const outputPriceError = toToken.symbol === "ETH" ? ethCoinGeckoError : tronPriceError;

  // // Network support check (kept for future use)
  // const _isNetworkSupported = [
  //   "ethereum",
  //   "arbitrum",
  //   "avalanche",
  //   "bnb",
  //   "gnosis",
  //   "solana",
  //   "sonic",
  //   "optimism",
  //   "polygon",
  //   "zksync",
  //   "base",
  //   "linea",
  //   "unichain",
  // ].includes(fromToken.chain.toLowerCase());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate output amount when input changes
  const calculateOutputAmount = useCallback(
    (inputAmount: string, inputTokenPrice: number, outputTokenPrice: number): string => {
      if (!inputAmount || !inputTokenPrice || !outputTokenPrice || parseFloat(inputAmount) <= 0) {
        return "0.00";
      }

      const inputValue = parseFloat(inputAmount);
      const inputUsdValue = inputValue * inputTokenPrice;
      const outputAmount = inputUsdValue / outputTokenPrice;

      return outputAmount.toFixed(6);
    },
    [],
  );

  // Update output amount when input changes or prices change
  useEffect(() => {
    if (fromToken.amount && inputPrice && outputPrice && !inputPriceLoading && !outputPriceLoading) {
      console.log("Recalculating output amount:", {
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        amount: fromToken.amount,
        inputPrice,
        outputPrice,
      });

      const outputAmount = calculateOutputAmount(fromToken.amount, inputPrice, outputPrice);

      // Only update if the amount has actually changed
      setToToken(prev => {
        if (prev.amount === outputAmount) return prev;
        return {
          ...prev,
          amount: outputAmount,
        };
      });
    }
  }, [
    fromToken.amount,
    fromToken.symbol,
    toToken.symbol,
    inputPrice,
    outputPrice,
    inputPriceLoading,
    outputPriceLoading,
    calculateOutputAmount,
  ]);

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
      inputPrice,
      outputPrice,
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
    // Clear amounts when switching tokens to avoid confusion
    setToToken({ ...toToken, amount: "" });
  };

  const handleToTokenChange = (symbol: string) => {
    setToToken({ ...toToken, symbol });
    // Clear amounts when switching tokens to avoid confusion
    setToToken({ ...toToken, symbol, amount: "" });
  };

  const handleSwapDirection = () => {
    console.log("Swapping direction:", { from: fromToken, to: toToken });

    // Store current values
    const tempFromToken = { ...fromToken };
    const tempToToken = { ...toToken };

    // Swap the tokens
    setFromToken({
      amount: tempToToken.amount,
      symbol: tempToToken.symbol,
      chain: tempToToken.chain,
    });

    setToToken({
      amount: tempFromToken.amount,
      symbol: tempFromToken.symbol,
      chain: tempFromToken.chain,
    });

    // Clear any input errors when swapping
    setInputError(null);
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
                {inputPriceLoading && fromToken.amount && (
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
                {inputPriceLoading && fromToken.amount && parseFloat(fromToken.amount) > 0 ? (
                  <span className="flex items-center text-sm text-gray-500">
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Fetching price...
                  </span>
                ) : inputPriceError ? (
                  <span className="text-error text-sm">Price unavailable</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {fromToken.amount && inputPrice
                      ? `~$${(parseFloat(fromToken.amount) * inputPrice).toFixed(2)}`
                      : "~$0.00"}
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
            <button
              className="btn btn-circle btn-sm hover:btn-primary transition-colors"
              onClick={handleSwapDirection}
              title="Swap direction"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="bg-base-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">You receive</span>
              {outputPriceLoading && fromToken.amount && (
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
                  readOnly={true}
                />
                {outputPriceLoading && fromToken.amount && (
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
                {outputPriceLoading && fromToken.amount ? (
                  <span className="flex items-center text-sm text-gray-500">
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Fetching price...
                  </span>
                ) : outputPriceError ? (
                  <span className="text-error text-sm">Price unavailable</span>
                ) : toToken.amount && outputPrice ? (
                  <span className="text-sm text-gray-500">
                    ~${(parseFloat(toToken.amount) * outputPrice).toFixed(2)}
                  </span>
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
