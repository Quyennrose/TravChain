export const exchangeRates = {
  USD_VND: 24500,
  VND_USD: 1 / 24500,
  USDT_USD: 1,
  USDT_VND: 24500,
};

export function convertCurrency(fromCurrency, toCurrency, amount) {
  if (fromCurrency === toCurrency) return amount;
  const key = `${fromCurrency}_${toCurrency}`;
  const rate = exchangeRates[key];
  if (!rate) {
    const error = new Error(`Unsupported conversion ${fromCurrency} -> ${toCurrency}`);
    error.statusCode = 400;
    throw error;
  }
  return Number((amount * rate).toFixed(toCurrency === 'VND' ? 0 : 2));
}
