import { useCallback, useEffect, useState } from "react";

interface TokenPriceData {
  [coinId: string]: {
    usd: number;
  };
}

interface UseTokenPriceReturn {
  price: number | null;
  loading: boolean;
  error: string | null;
  calculateOutputAmount: (inputAmount: string, inputPrice: number, outputPrice: number) => string;
}

// CoinGecko coin IDs
const COIN_IDS = {
  ETH: "ethereum",
  TRX: "tron",
} as const;

export const useTokenPrice = (symbol: string): UseTokenPriceReturn => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol || !COIN_IDS[symbol as keyof typeof COIN_IDS]) {
      setPrice(null);
      setError(`Unsupported token: ${symbol}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const coinId = COIN_IDS[symbol as keyof typeof COIN_IDS];
      const response = await fetch("/api/coingecko-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinIds: [coinId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${symbol} price from CoinGecko`);
      }

      const data: TokenPriceData = await response.json();
      setPrice(data[coinId]?.usd || null);
    } catch (err) {
      console.error(`Error fetching ${symbol} price:`, err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPrice(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const calculateOutputAmount = useCallback((inputAmount: string, inputPrice: number, outputPrice: number): string => {
    if (!inputAmount || !inputPrice || !outputPrice || parseFloat(inputAmount) <= 0) {
      return "0.00";
    }

    const inputValue = parseFloat(inputAmount);
    const inputUsdValue = inputValue * inputPrice;
    const outputAmount = inputUsdValue / outputPrice;

    return outputAmount.toFixed(6); // Show 6 decimal places
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Refresh price every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchPrice, 30000);
    return () => clearInterval(intervalId);
  }, [fetchPrice]);

  return {
    price,
    loading,
    error,
    calculateOutputAmount,
  };
};
