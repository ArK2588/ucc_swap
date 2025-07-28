import { useCallback, useEffect, useState } from "react";

interface CoinGeckoPriceData {
  [coinId: string]: {
    usd: number;
  };
}

interface UseCoinGeckoPriceReturn {
  tronPrice: number | null;
  loading: boolean;
  error: string | null;
  calculateTronAmount: (ethAmount: string, ethPrice: number) => string;
}

// CoinGecko coin ID for TRON
const TRON_COIN_ID = "tron";

export const useCoinGeckoPrice = (): UseCoinGeckoPriceReturn => {
  const [tronPrice, setTronPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTronPrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/coingecko-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coinIds: [TRON_COIN_ID],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch TRON price from CoinGecko");
      }

      const data: CoinGeckoPriceData = await response.json();
      setTronPrice(data[TRON_COIN_ID]?.usd || null);
    } catch (err) {
      console.error("Error fetching TRON price:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setTronPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTronAmount = useCallback(
    (ethAmount: string, ethPrice: number): string => {
      if (!ethAmount || !tronPrice || parseFloat(ethAmount) <= 0) {
        return "0.00";
      }

      const ethValue = parseFloat(ethAmount);
      const ethUsdValue = ethValue * ethPrice;
      const tronAmount = ethUsdValue / tronPrice;

      return tronAmount.toFixed(6); // Show 6 decimal places for TRON
    },
    [tronPrice],
  );

  useEffect(() => {
    fetchTronPrice();
  }, []);

  // Refresh TRON price every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchTronPrice, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return {
    tronPrice,
    loading,
    error,
    calculateTronAmount,
  };
};
