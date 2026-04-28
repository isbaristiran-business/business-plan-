// Stock database for autocomplete search.
// Live prices come from Finnhub API - this is just metadata.

export type Asset = {
  symbol: string;
  name: string;
  sector: string;
  type: 'Stock' | 'ETF' | 'Crypto';
  finnhubSymbol?: string; // crypto needs special prefix like BINANCE:BTCUSDT
};

export const STOCK_DATABASE: Asset[] = [
  // Major Tech
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', sector: 'Technology', type: 'Stock' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', sector: 'Technology', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', type: 'Stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication', type: 'Stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', type: 'Stock' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', type: 'Stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', type: 'Stock' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', type: 'Stock' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', type: 'Stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings', sector: 'Financial', type: 'Stock' },
  { symbol: 'UBER', name: 'Uber Technologies', sector: 'Technology', type: 'Stock' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', type: 'Stock' },
  { symbol: 'SQ', name: 'Block Inc.', sector: 'Financial', type: 'Stock' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', type: 'Stock' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', type: 'Stock' },

  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', type: 'Stock' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial', type: 'Stock' },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', sector: 'Financial', type: 'Stock' },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financial', type: 'Stock' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial', type: 'Stock' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial', type: 'Stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial', type: 'Stock' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway B', sector: 'Financial', type: 'Stock' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', type: 'Stock' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', type: 'Stock' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', type: 'Stock' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', type: 'Stock' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', type: 'Stock' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', type: 'Stock' },
  { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer', type: 'Stock' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer', type: 'Stock' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer', type: 'Stock' },
  { symbol: 'MCD', name: "McDonald's Corp.", sector: 'Consumer', type: 'Stock' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer', type: 'Stock' },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer', type: 'Stock' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer', type: 'Stock' },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication', type: 'Stock' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', type: 'Stock' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', type: 'Stock' },

  // ETFs
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'Index Fund', type: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', sector: 'Index Fund', type: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Index Fund', type: 'ETF' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Index Fund', type: 'ETF' },
  { symbol: 'IVV', name: 'iShares Core S&P 500', sector: 'Index Fund', type: 'ETF' },
  { symbol: 'VEA', name: 'Vanguard Developed Markets', sector: 'International', type: 'ETF' },
  { symbol: 'VWO', name: 'Vanguard Emerging Markets', sector: 'International', type: 'ETF' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market', sector: 'Bonds', type: 'ETF' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', sector: 'Bonds', type: 'ETF' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity', sector: 'Dividend', type: 'ETF' },
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield', sector: 'Dividend', type: 'ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', sector: 'Innovation', type: 'ETF' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'Technology', type: 'ETF' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', sector: 'Financial', type: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', sector: 'Energy', type: 'ETF' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', sector: 'Technology', type: 'ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', sector: 'Commodities', type: 'ETF' },
  { symbol: 'SLV', name: 'iShares Silver Trust', sector: 'Commodities', type: 'ETF' },

  // Crypto - need Binance prefix for Finnhub
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'SOL', name: 'Solana', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:SOLUSDT' },
  { symbol: 'ADA', name: 'Cardano', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:ADAUSDT' },
  { symbol: 'DOGE', name: 'Dogecoin', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:DOGEUSDT' },
  { symbol: 'XRP', name: 'Ripple', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:XRPUSDT' },
  { symbol: 'AVAX', name: 'Avalanche', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:AVAXUSDT' },
  { symbol: 'DOT', name: 'Polkadot', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:DOTUSDT' },
  { symbol: 'MATIC', name: 'Polygon', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:MATICUSDT' },
  { symbol: 'LINK', name: 'Chainlink', sector: 'Cryptocurrency', type: 'Crypto', finnhubSymbol: 'BINANCE:LINKUSDT' },
];

export const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#d97757',
  'Financial': '#c2410c',
  'Healthcare': '#a78050',
  'Consumer': '#6b8e7f',
  'Energy': '#8b5a3c',
  'Communication': '#9a7b4f',
  'Automotive': '#c9805f',
  'Index Fund': '#5d7a8c',
  'International': '#7d9a8c',
  'Bonds': '#8a8a7c',
  'Dividend': '#a89968',
  'Innovation': '#b87355',
  'Commodities': '#d4a574',
  'Cryptocurrency': '#e89456',
};

// Helper: get Finnhub symbol (for crypto, this is the exchange-prefixed version)
export function getFinnhubSymbol(asset: { symbol: string; finnhubSymbol?: string }): string {
  return asset.finnhubSymbol || asset.symbol;
}

export function findAsset(symbol: string): Asset | undefined {
  return STOCK_DATABASE.find(a => a.symbol === symbol);
}
