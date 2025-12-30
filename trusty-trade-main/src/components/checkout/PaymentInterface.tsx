import { useState } from 'react'
import { CreditCard, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

interface PaymentInterfaceProps {
  amount: number
  onPayment: () => void
  loading?: boolean
  className?: string
}

export const PaymentInterface = ({ amount, onPayment, loading, className }: PaymentInterfaceProps) => {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) { // MM/YY
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 4) {
      setCvv(value)
    }
  }

  const isFormValid = cardNumber.length >= 19 && expiryDate.length === 5 && cvv.length >= 3 && cardName.length > 0

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
      
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Payment Method Selection */}
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Credit/Debit Card
            </Label>
          </div>
        </RadioGroup>

        <Separator />

        {/* Card Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardName" className="text-sm font-medium">
              Cardholder Name
            </Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber" className="text-sm font-medium">
              Card Number
            </Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry" className="text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-primary mb-1">
                Secure Escrow Payment
              </h4>
              <p className="text-xs text-muted-foreground">
                Your payment will be held securely in escrow. The seller only receives payment after you verify the item.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={onPayment}
          disabled={!isFormValid || loading}
          className="w-full h-12 text-base font-semibold"
          variant="trust"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pay ${amount} with Escrow Protection
            </div>
          )}
        </Button>

        {/* Trust Message */}
        <p className="text-center text-xs text-muted-foreground">
          <strong>Seller is paid only after buyer approval</strong>
          <br />
          Your payment is protected by our escrow service
        </p>
      </div>
    </div>
  )
}