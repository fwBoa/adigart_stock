'use client'

import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger
} from '@/components/ui/sheet'
import { ShoppingCart, Minus, Plus, X, Banknote, CreditCard, Loader2, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { processCartTransaction } from '@/app/actions'

interface CartDrawerProps {
    projectId: string
}

export function CartDrawer({ projectId }: CartDrawerProps) {
    const { items, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems, isOpen, setIsOpen } = useCart()
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
    const [comment, setComment] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    const handleCheckout = () => {
        if (items.length === 0) return

        setError('')
        startTransition(async () => {
            const result = await processCartTransaction(
                items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    amount: item.unitPrice * item.quantity,
                })),
                paymentMethod,
                comment || undefined
            )

            if (result.success) {
                clearCart()
                setComment('')
                setIsOpen(false)
            } else {
                setError(result.message || 'Erreur lors de la validation')
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Panier ({totalItems} article{totalItems !== 1 ? 's' : ''})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                            Votre panier est vide.<br />
                            Ajoutez des produits avec le bouton <strong>+</strong>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.productName}</p>
                                        {item.variantLabel && (
                                            <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                                        )}
                                        <p className="text-sm text-primary font-semibold mt-1">
                                            {(item.unitPrice * item.quantity).toFixed(2)} €
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1 border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.maxStock}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Remove */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Payment Method */}
                        <div className="border-t pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${paymentMethod === 'CASH'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Banknote className={`h-6 w-6 ${paymentMethod === 'CASH' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-sm font-medium ${paymentMethod === 'CASH' ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Espèces
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${paymentMethod === 'CARD'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <CreditCard className={`h-6 w-6 ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-sm font-medium ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Carte
                                    </span>
                                </button>
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <Label htmlFor="cart-comment" className="text-sm">Commentaire (optionnel)</Label>
                                <Input
                                    id="cart-comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ex: Client régulier, remise..."
                                    maxLength={255}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Total & Actions */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{totalAmount.toFixed(2)} €</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={clearCart}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Vider
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleCheckout}
                                        disabled={isPending || items.length === 0}
                                    >
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Valider
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
