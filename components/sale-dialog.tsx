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

type Variant = {
    id: string
    product_id: string
    size: string | null
    color: string | null
    stock: number
    sku: string | null
}

interface SaleDialogProps {
    productId: string
    productName: string
    quantity: number
    amount: number
    disabled: boolean
    variants?: Variant[]
}

export function SaleDialog({ productId, productName, quantity, amount, disabled, variants = [] }: SaleDialogProps) {
    const [open, setOpen] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
    const [state, action, isPending] = useActionState(processTransaction, initialState)

    const hasVariants = variants.length > 0
    const selectedVariant = variants.find(v => v.id === selectedVariantId)
    const canSell = hasVariants ? (selectedVariant && selectedVariant.stock >= quantity) : !disabled

    useEffect(() => {
        if (state.message === 'Transaction successful' && open) {
            setOpen(false)
            setPaymentMethod('CASH')
            setSelectedVariantId(null)
        }
    }, [state.message, open])

    // Auto-select first variant with stock
    useEffect(() => {
        if (hasVariants && !selectedVariantId) {
            const firstWithStock = variants.find(v => v.stock > 0)
            if (firstWithStock) setSelectedVariantId(firstWithStock.id)
        }
    }, [hasVariants, variants, selectedVariantId])

    const formatVariantLabel = (v: Variant) => {
        const parts = []
        if (v.size) parts.push(v.size)
        if (v.color) parts.push(v.color)
        return parts.length > 0 ? parts.join(' / ') : (v.sku || 'Variante')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    disabled={disabled && !hasVariants}
                    className="flex-1 h-10"
                >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Vendre
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Confirmer la vente</DialogTitle>
                    <DialogDescription>
                        {quantity}x {productName} — {amount.toFixed(2)} €
                    </DialogDescription>
                </DialogHeader>

                <form action={action} className="space-y-4">
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="variantId" value={selectedVariantId || ''} />
                    <input type="hidden" name="type" value="SALE" />
                    <input type="hidden" name="quantity" value={quantity} />
                    <input type="hidden" name="amount" value={amount} />
                    <input type="hidden" name="paymentMethod" value={paymentMethod} />

                    {/* Variant Selection */}
                    {hasVariants && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Sélectionner la variante</p>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setSelectedVariantId(v.id)}
                                        disabled={v.stock < quantity}
                                        className={`p-2 rounded-lg border text-left text-sm transition-all ${selectedVariantId === v.id
                                                ? 'border-primary bg-primary/10'
                                                : v.stock < quantity
                                                    ? 'border-muted opacity-50 cursor-not-allowed'
                                                    : 'border-muted hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="font-medium truncate">{formatVariantLabel(v)}</div>
                                        <div className={`text-xs ${v.stock <= 5 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                            {v.stock} en stock
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                        <Button type="submit" disabled={isPending || (hasVariants && !canSell)}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Valider ({amount.toFixed(2)} €)
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
