import { useEffect, useState } from "react";

interface SpotPriceData {
  [tokenAddress: string]: string;
}

interface UseSpotPriceReturn {
  price: number | null;
  loading: boolean;
  error: string | null;
  usdValue: string;
}

// Common token addresses for supported networks
const TOKEN_ADDRESSES = {
  ethereum: {
    ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Native ETH
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    USDC: "0xa0b86a33e6c3b0f4f5b4c3b0a0b86a33e6c3b0f4",
  },
  arbitrum: {
    ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  },
  polygon: {
    MATIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    WETH: "0x7ceb23fd6c0a6b8b8b8b8b8b8b8b8b8b8b8b8b8b",
  },
  // Add more networks as needed
};

export const useSpotPrice = (
  tokenSymbol: string,
  network: string = "ethereum",
  amount: string = "1",
): UseSpotPriceReturn => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenAddress = (symbol: string, networkName: string): string | null => {
    const networkTokens = TOKEN_ADDRESSES[networkName.toLowerCase() as keyof typeof TOKEN_ADDRESSES];
    if (!networkTokens) return null;

    return networkTokens[symbol.toUpperCase() as keyof typeof networkTokens] || null;
  };

  const fetchSpotPrice = async () => {
    if (!tokenSymbol || !amount || parseFloat(amount) <= 0) {
      setPrice(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenAddress = getTokenAddress(tokenSymbol, network);

      if (!tokenAddress) {
        throw new Error(`Token ${tokenSymbol} not supported on ${network}`);
      }

      const response = await fetch("/api/spot-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
          tokens: [tokenAddress],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch price");
      }

      const data: SpotPriceData = await response.json();
      const tokenPrice = data[tokenAddress];

      if (tokenPrice) {
        // 1inch now returns USD price directly as a string
        const priceInUSD = parseFloat(tokenPrice);
        setPrice(priceInUSD);
      } else {
        throw new Error("Price data not available");
      }
    } catch (err) {
      console.error("Error fetching spot price:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSpotPrice();
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [tokenSymbol, network, amount]);

  // Refresh price every 30 seconds
  useEffect(() => {
    if (price !== null) {
      const intervalId = setInterval(fetchSpotPrice, 30000);
      return () => clearInterval(intervalId);
    }
  }, [price, tokenSymbol, network, amount]);

  const usdValue = price && amount && parseFloat(amount) > 0 ? (price * parseFloat(amount)).toFixed(2) : "0.00";

  return {
    price,
    loading,
    error,
    usdValue,
  };
};
