import { useState } from 'react'
import { Check, X, Power, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  checked: boolean
}

interface VerificationChecklistProps {
  onComplete: (allChecked: boolean) => void
  onDispute: () => void
  className?: string
}

export const VerificationChecklist = ({ onComplete, onDispute, className }: VerificationChecklistProps) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'powers_on',
      label: 'Powers On',
      description: 'Device turns on and boots up properly',
      icon: <Power className="h-5 w-5" />,
      checked: false
    },
    {
      id: 'no_damage',
      label: 'No Physical Damage',
      description: 'No cracks, dents, or visible damage to the device',
      icon: <Shield className="h-5 w-5" />,
      checked: false
    },
    {
      id: 'matches_description',
      label: 'Matches Description',
      description: 'Product condition and specifications match the listing',
      icon: <FileText className="h-5 w-5" />,
      checked: false
    }
  ])

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked } : item
    ))
  }

  const allChecked = items.every(item => item.checked)

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Product Verification Checklist
        </h3>
        <p className="text-sm text-muted-foreground">
          Please verify each item below. If any item fails, you can raise a dispute for a full refund.
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg border transition-all',
              item.checked 
                ? 'border-success bg-success/5' 
                : 'border-border bg-card hover:bg-muted/50'
            )}
          >
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
              item.checked 
                ? 'border-success bg-success text-success-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            )}>
              {item.checked ? <Check className="h-5 w-5" /> : item.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <label
                  htmlFor={item.id}
                  className={cn(
                    'font-medium cursor-pointer transition-colors',
                    item.checked ? 'text-success' : 'text-foreground'
                  )}
                >
                  {item.label}
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          onClick={() => onComplete(allChecked)}
          disabled={!allChecked}
          variant="trust"
          size="lg"
          className="flex-1"
        >
          <Check className="h-5 w-5 mr-2" />
          {allChecked ? 'Mark as Working - Release Payment' : 'Complete All Checks First'}
        </Button>

        <Button
          onClick={onDispute}
          variant="outline"
          size="lg"
          className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-5 w-5 mr-2" />
          Report Issue & Request Refund
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <strong>Need help?</strong> If you're unsure about any item, contact our support team. 
          You have full escrow protection until you approve the product.
        </p>
      </div>
    </div>
  )
}