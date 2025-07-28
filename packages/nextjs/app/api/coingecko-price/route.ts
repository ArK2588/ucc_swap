import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { coinIds } = await request.json();

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return NextResponse.json({ error: "Invalid coin IDs provided" }, { status: 400 });
    }

    // CoinGecko API endpoint for simple price
    const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd`;

    const response = await fetch(coinGeckoUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching CoinGecko prices:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch prices" },
      { status: 500 },
    );
  }
}
