'use client'

import { useState, useActionState, useTransition } from 'react'
import { processTransaction, TransactionState, deleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Gift, Minus, Plus, Trash2 } from 'lucide-react'
import { RestockDialog } from '@/components/restock-dialog'
import { EditProductDialog } from '@/components/edit-product-dialog'
import { SaleDialog } from '@/components/sale-dialog'

type Category = {
    id: string
    name: string
}

type Product = {
    id: string
    name: string
    sku: string | null
    price: number
    stock: number
    image_url: string | null
    category_id?: string | null
}

const initialState: TransactionState = {
    message: '',
    errors: {}
}

interface ProductRowProps {
    product: Product
    projectId: string
    categories: Category[]
}

// Mobile Card Component
export function ProductCard({ product, projectId, categories }: ProductRowProps) {
    const [qty, setQty] = useState(1)
    const [isPendingDelete, startDeleteTransition] = useTransition()

    const handleDelete = () => {
        if (confirm(`Supprimer "${product.name}" et toutes ses transactions ?`)) {
            startDeleteTransition(async () => {
                await deleteProduct(product.id, projectId)
            })
        }
    }

    const incrementQty = () => setQty(prev => Math.min(prev + 1, product.stock))
    const decrementQty = () => setQty(prev => Math.max(prev - 1, 1))

    return (
        <div className="border rounded-lg p-4 bg-card transition-all hover:shadow-md" data-low-stock={product.stock <= 5}>
            {/* Header: Image + Name + Actions */}
            <div className="flex items-start gap-3 mb-3">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-14 w-14 rounded-lg object-cover shrink-0"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="text-sm text-muted-foreground">?</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <EditProductDialog product={product} categories={categories} projectId={projectId} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={handleDelete}
                        disabled={isPendingDelete}
                    >
                        {isPendingDelete ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Price & Stock Row */}
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-lg font-bold">{product.price.toFixed(2)} €</span>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium ${product.stock <= 5
                            ? product.stock === 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                    >
                        {product.stock} en stock
                    </span>
                    <RestockDialog product={product} />
                </div>
            </div>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-2">
                {/* Quantity Selector */}
                <div className="flex items-center border rounded-lg bg-background">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0"
                        onClick={decrementQty}
                        disabled={qty <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={qty}
                        onChange={(e) => setQty(Math.min(Number(e.target.value), product.stock))}
                        className="w-14 h-10 text-center border-0 focus-visible:ring-0 text-lg font-medium"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0"
                        onClick={incrementQty}
                        disabled={qty >= product.stock}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex gap-2">
                    <SaleDialog
                        productId={product.id}
                        productName={product.name}
                        quantity={qty}
                        amount={product.price * qty}
                        disabled={product.stock === 0}
                    />
                    <TransactionButton
                        productId={product.id}
                        type="GIFT"
                        quantity={qty}
                        amount={0}
                        disabled={product.stock === 0}
                        label="Don"
                        icon={<Gift className="h-4 w-4" />}
                        variant="secondary"
                        className="h-10 px-3"
                    />
                </div>
            </div>
        </div>
    )
}

// Desktop Table Row Component
export function ProductTableRow({ product, projectId, categories }: ProductRowProps) {
    const [qty, setQty] = useState(1)
    const [isPendingDelete, startDeleteTransition] = useTransition()

    const handleDelete = () => {
        if (confirm(`Supprimer "${product.name}" et toutes ses transactions ?`)) {
            startDeleteTransition(async () => {
                await deleteProduct(product.id, projectId)
            })
        }
    }

    const incrementQty = () => setQty(prev => Math.min(prev + 1, product.stock))
    const decrementQty = () => setQty(prev => Math.max(prev - 1, 1))

    return (
        <tr
            className="border-b transition-all duration-200 hover:bg-muted/50"
            data-low-stock={product.stock <= 5}
        >
            <td className="p-4 align-middle">
                <div className="flex items-center gap-3">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">?</span>
                        </div>
                    )}
                    <div className="font-medium">{product.name}</div>
                </div>
            </td>
            <td className="p-4 align-middle text-muted-foreground">
                {product.sku || '-'}
            </td>
            <td className="p-4 align-middle">
                <span className="font-semibold">{product.price.toFixed(2)} €</span>
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex items-center justify-end gap-2">
                    <span
                        className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-sm font-medium ${product.stock <= 5
                            ? product.stock === 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                    >
                        {product.stock}
                    </span>
                    <RestockDialog product={product} />
                </div>
            </td>
            <td className="p-4 align-middle">
                <div className="flex items-center gap-2 justify-end">
                    {/* Edit & Delete */}
                    <EditProductDialog product={product} categories={categories} projectId={projectId} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={handleDelete}
                        disabled={isPendingDelete}
                    >
                        {isPendingDelete ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>

                    {/* Quantity Selector */}
                    <div className="flex items-center border rounded-md">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={decrementQty}
                            disabled={qty <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={qty}
                            onChange={(e) => setQty(Math.min(Number(e.target.value), product.stock))}
                            className="w-12 h-8 text-center border-0 focus-visible:ring-0"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={incrementQty}
                            disabled={qty >= product.stock}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Transaction Buttons */}
                    <SaleDialog
                        productId={product.id}
                        productName={product.name}
                        quantity={qty}
                        amount={product.price * qty}
                        disabled={product.stock === 0}
                    />
                    <TransactionButton
                        productId={product.id}
                        type="GIFT"
                        quantity={qty}
                        amount={0}
                        disabled={product.stock === 0}
                        label="Don"
                        icon={<Gift className="h-4 w-4" />}
                        variant="secondary"
                    />
                </div>
            </td>
        </tr>
    )
}

// Sub-component for transaction buttons
function TransactionButton({
    productId,
    type,
    quantity,
    amount,
    disabled,
    label,
    icon,
    variant,
    className = ""
}: {
    productId: string
    type: 'SALE' | 'GIFT'
    quantity: number
    amount: number
    disabled: boolean
    label: string
    icon: React.ReactNode
    variant: 'default' | 'secondary'
    className?: string
}) {
    const [state, action, isPending] = useActionState(processTransaction, initialState)

    return (
        <form action={action}>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="quantity" value={quantity} />
            <input type="hidden" name="amount" value={amount} />
            <Button
                type="submit"
                variant={variant}
                size="sm"
                disabled={disabled || isPending}
                className={className}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        {icon}
                        <span className="ml-1.5">{label}</span>
                    </>
                )}
            </Button>
            {state.message && state.message !== 'Transaction successful' && (
                <span className="sr-only text-red-500">{state.message}</span>
            )}
        </form>
    )
}
