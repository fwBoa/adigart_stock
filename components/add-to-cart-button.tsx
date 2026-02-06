'use client'

import { useCart } from '@/lib/cart-context'
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
import { Plus, Check, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

type Variant = {
    id: string
    product_id: string
    size: string | null
    color: string | null
    stock: number
    sku: string | null
}

interface AddToCartButtonProps {
    productId: string
    productName: string
    price: number
    stock: number
    quantity: number
    variants?: Variant[]
}

export function AddToCartButton({
    productId,
    productName,
    price,
    stock,
    quantity,
    variants = []
}: AddToCartButtonProps) {
    const { addToCart, items } = useCart()
    const [added, setAdded] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

    const hasVariants = variants.length > 0
    const selectedVariant = variants.find(v => v.id === selectedVariantId)

    // Check if already in cart (any variant)
    const inCart = items.find(
        i => i.productId === productId
    )

    const formatVariantLabel = (v: Variant) => {
        const parts = []
        if (v.size) parts.push(v.size)
        if (v.color) parts.push(v.color)
        return parts.length > 0 ? parts.join(' / ') : (v.sku || 'Variante')
    }

    const handleAddDirect = () => {
        // For products WITHOUT variants
        if (stock <= 0) return

        addToCart({
            productId,
            productName,
            variantId: null,
            variantLabel: null,
            quantity: Math.min(quantity, stock),
            unitPrice: price,
            maxStock: stock,
        })

        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    const handleAddWithVariant = () => {
        // For products WITH variants
        if (!selectedVariant || selectedVariant.stock <= 0) return

        addToCart({
            productId,
            productName,
            variantId: selectedVariant.id,
            variantLabel: formatVariantLabel(selectedVariant),
            quantity: Math.min(quantity, selectedVariant.stock),
            unitPrice: price,
            maxStock: selectedVariant.stock,
        })

        setAdded(true)
        setOpen(false)
        setSelectedVariantId(null)
        setTimeout(() => setAdded(false), 1500)
    }

    const totalStock = hasVariants
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : stock

    const isDisabled = totalStock <= 0

    // Simple button for products WITHOUT variants
    if (!hasVariants) {
        return (
            <Button
                variant={added ? "default" : "secondary"}
                size="icon"
                className={`h-10 w-10 transition-all ${added ? 'bg-green-600 hover:bg-green-600' : ''}`}
                onClick={handleAddDirect}
                disabled={isDisabled}
                title={inCart ? `Déjà dans le panier (${inCart.quantity})` : 'Ajouter au panier'}
            >
                {added ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
            </Button>
        )
    }

    // Dialog for products WITH variants
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={added ? "default" : "secondary"}
                    size="icon"
                    className={`h-10 w-10 transition-all ${added ? 'bg-green-600 hover:bg-green-600' : ''}`}
                    disabled={isDisabled}
                    title="Ajouter au panier"
                >
                    {added ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Ajouter au panier
                    </DialogTitle>
                    <DialogDescription>
                        {quantity}x {productName} — {(price * quantity).toFixed(2)} €
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <p className="text-sm font-medium text-muted-foreground">Choisir une variante</p>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {variants.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedVariantId(v.id)}
                                disabled={v.stock < quantity}
                                className={`p-3 rounded-lg border text-left text-sm transition-all ${selectedVariantId === v.id
                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                        : v.stock < quantity
                                            ? 'border-muted opacity-50 cursor-not-allowed'
                                            : 'border-muted hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-medium truncate">{formatVariantLabel(v)}</div>
                                <div className={`text-xs mt-1 ${v.stock <= 5 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                                    {v.stock} en stock
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleAddWithVariant}
                        disabled={!selectedVariant || selectedVariant.stock < quantity}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
