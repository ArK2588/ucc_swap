# 1inch Spot Price API Integration

This document explains the integration of 1inch Spot Price API for real-time ETH to USD conversion in the cross-chain swap UI.

## Features

- **Real-time Price Display**: Shows live ETH to USD conversion as users type amounts
- **Multi-Network Support**: Supports all 1inch-compatible networks (Ethereum, Arbitrum, Polygon, etc.)
- **CORS Handling**: Uses Next.js API routes to proxy 1inch API calls
- **Error Handling**: Graceful fallbacks for unsupported networks and API errors
- **Loading States**: Visual indicators during price fetching

## Setup

1. **Get 1inch API Key**:
   - Visit [1inch Developer Portal](https://portal.1inch.dev/)
   - Create an account and generate an API key

2. **Environment Configuration**:
   ```bash
   cp .env.example .env.local
   ```
   Add your API key to `.env.local`:
   ```
   INCH_API_KEY=your_api_key_here
   ```

3. **Supported Networks**:
   - Ethereum Mainnet
   - Arbitrum
   - Avalanche
   - BNB Chain
   - Gnosis
   - Solana
   - Sonic
   - Optimism
   - Polygon
   - zkSync Era
   - Base
   - Linea
   - Unichain

## API Endpoints

### `/api/spot-price`
Proxies requests to 1inch Spot Price API to avoid CORS issues.

**Parameters**:
- `network`: Network name (e.g., 'ethereum', 'arbitrum')
- `tokens`: Token contract address

**Example**:
```
GET /api/spot-price?network=ethereum&tokens=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
```

## Components

### `useSpotPrice` Hook
Custom React hook that:
- Fetches real-time token prices
- Handles loading states and errors
- Debounces API calls (300ms)
- Auto-refreshes prices every 30 seconds
- Calculates USD values based on input amounts

### SwapBox Component
Updated to display:
- Real-time USD values for ETH amounts
- Loading spinners during price fetching
- Error states for failed API calls
- Network-specific messaging (e.g., "Tron price coming soon")

## Error Handling

- **Unsupported Networks**: Shows placeholder text
- **API Failures**: Displays "Price unavailable" message
- **Invalid Tokens**: Graceful fallback to $0.00
- **Network Issues**: Retry mechanism with exponential backoff

## Future Enhancements

- Add support for more tokens (USDT, USDC, etc.)
- Implement price history charts
- Add price alerts and notifications
- Integrate Tron-specific price APIs
