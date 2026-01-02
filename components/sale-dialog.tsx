'use client'

import { useState, useActionState, useEffect } from 'react'
import { processTransaction, TransactionState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, ShoppingCart, Banknote, CreditCard } from 'lucide-react'

const initialState: TransactionState = {
    message: '',
    errors: {}
}

interface SaleDialogProps {
    productId: string
    productName: string
    quantity: number
    amount: number
    disabled: boolean
}

export function SaleDialog({ productId, productName, quantity, amount, disabled }: SaleDialogProps) {
    const [open, setOpen] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
    const [state, action, isPending] = useActionState(processTransaction, initialState)

    useEffect(() => {
        if (state.message === 'Transaction successful' && open) {
            setOpen(false)
            setPaymentMethod('CASH') // Reset
        }
    }, [state.message, open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    disabled={disabled}
                    className="flex-1 h-10"
                >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Vendre
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Confirmer la vente</DialogTitle>
                    <DialogDescription>
                        {quantity}x {productName} — {amount.toFixed(2)} €
                    </DialogDescription>
                </DialogHeader>

                <form action={action} className="space-y-4">
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="type" value="SALE" />
                    <input type="hidden" name="quantity" value={quantity} />
                    <input type="hidden" name="amount" value={amount} />
                    <input type="hidden" name="paymentMethod" value={paymentMethod} />

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'CASH'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted hover:border-primary/50'
                                }`}
                        >
                            <Banknote className={`h-8 w-8 ${paymentMethod === 'CASH' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${paymentMethod === 'CASH' ? 'text-primary' : 'text-muted-foreground'}`}>
                                Espèces
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CARD')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'CARD'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted hover:border-primary/50'
                                }`}
                        >
                            <CreditCard className={`h-8 w-8 ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`}>
                                Carte
                            </span>
                        </button>
                    </div>

                    {state.message && state.message !== 'Transaction successful' && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                            {state.message}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Valider ({amount.toFixed(2)} €)
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
