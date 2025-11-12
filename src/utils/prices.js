// src/utils/prices.js
export const AD_PRICES = [500, 1000, 1500, 2000]

export const getPrice = (weeks) => {
  const index = weeks - 1
  if (index < 0 || index > 3) return 0
  return AD_PRICES[index] || 500
}