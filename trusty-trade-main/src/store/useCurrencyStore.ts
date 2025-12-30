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

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: currencies[0], // Default to INR

      setCurrency: (code: CurrencyCode) => {
        const currency = currencies.find(c => c.code === code)
        if (currency) {
          set({ currency })
        }
      },

      convertFromINR: (priceInINR: number) => {
        const { currency } = get()
        return Math.round(priceInINR * currency.rate)
      },

      convertToINR: (price: number, fromCurrency: CurrencyCode) => {
        const curr = currencies.find(c => c.code === fromCurrency)
        if (!curr) return price
        return Math.round(price / curr.rate)
      },

      formatPrice: (priceInINR: number) => {
        const { currency } = get()
        const converted = Math.round(priceInINR * currency.rate)
        
        if (currency.code === 'INR') {
          return `${currency.symbol}${converted.toLocaleString('en-IN')}`
        }
        return `${currency.symbol}${converted.toLocaleString()}`
      },

      formatPriceValue: (priceInINR: number) => {
        const { currency } = get()
        const converted = Math.round(priceInINR * currency.rate)
        
        let formatted: string
        if (currency.code === 'INR') {
          formatted = converted.toLocaleString('en-IN')
        } else {
          formatted = converted.toLocaleString()
        }
        
        return {
          symbol: currency.symbol,
          value: converted,
          formatted: `${currency.symbol}${formatted}`
        }
      },
    }),
    {
      name: 'currency-storage',
    }
  )
)
