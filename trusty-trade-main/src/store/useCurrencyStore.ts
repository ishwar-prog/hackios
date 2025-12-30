import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD'

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
  rate: number // Rate relative to INR (base currency)
}

// Base currency is INR, all product prices are stored in INR
export const currencies: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.79 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 0.018 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 0.016 },
]

// Conversion rate from USD to INR (for legacy data)
export const USD_TO_INR = 83

interface CurrencyStore {
  currency: Currency
  setCurrency: (code: CurrencyCode) => void
  convertFromINR: (priceInINR: number) => number
  convertToINR: (price: number, fromCurrency: CurrencyCode) => number
  formatPrice: (priceInINR: number) => string
  formatPriceValue: (priceInINR: number) => { symbol: string; value: number; formatted: string }
}

// FIXED: Force INR-only currency system - no conversions allowed
export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: currencies[0], // Always INR - locked

      setCurrency: (code: CurrencyCode) => {
        // PRODUCTION LOCK: Only allow INR to prevent currency mixing
        if (code === 'INR') {
          const currency = currencies.find(c => c.code === code)
          if (currency) {
            set({ currency })
          }
        }
      },

      convertFromINR: (priceInINR: number) => {
        // PRODUCTION LOCK: No conversion - always return INR value
        return Math.round(priceInINR)
      },

      convertToINR: (price: number, fromCurrency: CurrencyCode) => {
        // PRODUCTION LOCK: No conversion - always return input value as INR
        return Math.round(price)
      },

      formatPrice: (priceInINR: number) => {
        // PRODUCTION LOCK: Always format as INR
        const value = Math.round(priceInINR)
        return `₹${value.toLocaleString('en-IN')}`
      },

      formatPriceValue: (priceInINR: number) => {
        // PRODUCTION LOCK: Always format as INR
        const value = Math.round(priceInINR)
        const formatted = value.toLocaleString('en-IN')
        
        return {
          symbol: '₹',
          value: value,
          formatted: `₹${formatted}`
        }
      },
    }),
    {
      name: 'currency-storage',
    }
  )
)
