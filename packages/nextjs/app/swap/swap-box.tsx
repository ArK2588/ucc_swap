"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Balance } from "~~/components/scaffold-eth";

const SwapBox = () => {
  const [fromToken, setFromToken] = useState({
    amount: "",
    symbol: "ETH",
    chain: "Ethereum",
  });

  const [toToken, setToToken] = useState({
    amount: "",
    symbol: "USDT",
    chain: "Tron",
  });

  const [isClient, setIsClient] = useState(false);
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // TODO: Initialize token balance hook once we have a token contract
  // For now, we'll use the connectedAddress to show ETH balance

  const handleSwap = () => {
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
              <input
                type="text"
                placeholder="0.0"
                className="input input-ghost w-full text-2xl font-semibold p-0 focus:outline-none"
                value={fromToken.amount}
                onChange={e => setFromToken({ ...fromToken, amount: e.target.value })}
              />
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                  {fromToken.symbol} ▼
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={() => setFromToken({ ...fromToken, symbol: "ETH" })}>ETH</button>
                  </li>
                  <li>
                    <button onClick={() => setFromToken({ ...fromToken, symbol: "USDT" })}>USDT</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">{fromToken.chain}</span>
              <span className="text-sm text-gray-500">~$0.00</span>
            </div>
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
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="0.0"
                className="input input-ghost w-full text-2xl font-semibold p-0 focus:outline-none"
                value={toToken.amount}
                onChange={e => setToToken({ ...toToken, amount: e.target.value })}
              />
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm btn-outline">
                  {toToken.symbol} ▼
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={() => setToToken({ ...toToken, symbol: "USDT" })}>USDT</button>
                  </li>
                  <li>
                    <button onClick={() => setToToken({ ...toToken, symbol: "TRX" })}>TRX</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">{toToken.chain}</span>
              <span className="text-sm text-gray-500">~$0.00</span>
            </div>
          </div>

          {/* Connect/Approve/Swap Button */}
          {!connectedAddress ? (
            <button className="btn btn-primary w-full">Connect Wallet</button>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={handleSwap}
              disabled={!fromToken.amount || !toToken.amount}
            >
              Swap
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapBox;
