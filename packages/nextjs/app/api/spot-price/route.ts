import { NextRequest, NextResponse } from "next/server";

const INCH_API_BASE_URL = "https://api.1inch.dev";

// Supported networks for 1inch Spot Price API
const SUPPORTED_NETWORKS = {
  ethereum: "1",
  arbitrum: "42161",
  avalanche: "43114",
  bnb: "56",
  gnosis: "100",
  solana: "solana",
  sonic: "146",
  optimism: "10",
  polygon: "137",
  zksync: "324",
  base: "8453",
  linea: "59144",
  unichain: "1301",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network = "ethereum", tokens } = body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ error: "Tokens array is required" }, { status: 400 });
    }

    // Check if network is supported
    const chainId = SUPPORTED_NETWORKS[network.toLowerCase() as keyof typeof SUPPORTED_NETWORKS];
    if (!chainId) {
      return NextResponse.json(
        { error: `Network ${network} is not supported by 1inch Spot Price API` },
        { status: 400 },
      );
    }

    // Make POST request to 1inch API with proper body
    const apiUrl = `${INCH_API_BASE_URL}/price/v1.1/${chainId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INCH_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokens: tokens,
        currency: "USD",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("1inch API error:", response.status, errorText);
      return NextResponse.json({ error: `1inch API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Debug logging to see actual API response
    console.log("1inch API Response:", JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Spot price API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
