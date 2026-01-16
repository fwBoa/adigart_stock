'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
    id: string // unique id for cart item
    productId: string
    productName: string
    variantId: string | null
    variantLabel: string | null
    quantity: number
    unitPrice: number
    maxStock: number
}

type CartContextType = {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, 'id'>) => void
    removeFromCart: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    totalAmount: number
    totalItems: number
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'adigart-cart'

export function CartProvider({ children, projectId }: { children: ReactNode; projectId: string }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)

    const storageKey = `${STORAGE_KEY}-${projectId}`

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
            try {
                setItems(JSON.parse(stored))
            } catch {
                localStorage.removeItem(storageKey)
            }
        }
        setIsHydrated(true)
    }, [storageKey])

    // Save to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(storageKey, JSON.stringify(items))
        }
    }, [items, isHydrated, storageKey])

    const addToCart = (item: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            // Check if same product/variant already in cart
            const existingIndex = prev.findIndex(
                i => i.productId === item.productId && i.variantId === item.variantId
            )

            if (existingIndex >= 0) {
                // Update quantity
                const updated = [...prev]
                const newQty = Math.min(updated[existingIndex].quantity + item.quantity, item.maxStock)
                updated[existingIndex] = { ...updated[existingIndex], quantity: newQty }
                return updated
            }

            // Add new item
            return [...prev, { ...item, id: crypto.randomUUID() }]
        })
    }

    const removeFromCart = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId: string, quantity: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }
                    : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalAmount,
                totalItems,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
