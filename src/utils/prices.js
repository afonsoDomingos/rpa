// @/utils/prices.js
export const AD_PRICES = [500, 1000, 1500, 2000]

export const getPrice = (weeks) => {
  if (!weeks || weeks < 1 || weeks > 4) return 0
  return AD_PRICES[weeks - 1] || 500
}