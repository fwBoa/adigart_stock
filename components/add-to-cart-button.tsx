'use client'

import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Plus, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

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
    variant?: Variant | null
}

export function AddToCartButton({
    productId,
    productName,
    price,
    stock,
    quantity,
    variant
}: AddToCartButtonProps) {
    const { addToCart, setIsOpen, items } = useCart()
    const [added, setAdded] = useState(false)

    // Check if already in cart
    const inCart = items.find(
        i => i.productId === productId && i.variantId === (variant?.id || null)
    )

    const formatVariantLabel = (v: Variant) => {
        const parts = []
        if (v.size) parts.push(v.size)
        if (v.color) parts.push(v.color)
        return parts.length > 0 ? parts.join(' / ') : null
    }

    const handleAdd = () => {
        const maxStock = variant ? variant.stock : stock
        if (maxStock <= 0) return

        addToCart({
            productId,
            productName,
            variantId: variant?.id || null,
            variantLabel: variant ? formatVariantLabel(variant) : null,
            quantity: Math.min(quantity, maxStock),
            unitPrice: price,
            maxStock,
        })

        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    const maxStock = variant ? variant.stock : stock
    const isDisabled = maxStock <= 0

    return (
        <Button
            variant={added ? "default" : "secondary"}
            size="icon"
            className={`h-10 w-10 transition-all ${added ? 'bg-green-600 hover:bg-green-600' : ''}`}
            onClick={handleAdd}
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
