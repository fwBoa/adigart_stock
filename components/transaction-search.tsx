'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, ChevronUp, Package, TrendingUp, ShoppingBag, Gift, Euro } from 'lucide-react'

type Transaction = {
    id: string
    product_id: string
    variant_id: string | null
    type: 'SALE' | 'GIFT'
    payment_method: 'CASH' | 'CARD' | null
    quantity: number
    amount: number
    comment: string | null
    sale_group_id: string | null
    created_at: string
    products?: { id: string; name: string }
    product_variants?: { id: string; size: string | null; color: string | null } | null
}

interface TransactionSearchProps {
    transactions: Transaction[]
    onFilteredTransactions: (filtered: Transaction[]) => void
}

type ProductStats = {
    productId: string
    productName: string
    variants: {
        variantId: string | null
        label: string
        salesCount: number
        salesQuantity: number
        salesAmount: number
        giftsCount: number
        giftsQuantity: number
    }[]
    totalSalesCount: number
    totalSalesQuantity: number
    totalSalesAmount: number
    totalGiftsCount: number
    totalGiftsQuantity: number
}

export function TransactionSearch({ transactions, onFilteredTransactions }: TransactionSearchProps) {
    const [search, setSearch] = useState('')
    const [showStats, setShowStats] = useState(false)

    // Filter transactions based on search
    useMemo(() => {
        if (!search.trim()) {
            onFilteredTransactions(transactions)
            return
        }

        const searchLower = search.toLowerCase()
        const filtered = transactions.filter(t => {
            const productName = t.products?.name?.toLowerCase() || ''
            const variant = t.product_variants
                ? `${t.product_variants.size || ''} ${t.product_variants.color || ''}`.toLowerCase()
                : ''
            const comment = t.comment?.toLowerCase() || ''
            const type = t.type === 'SALE' ? 'vente' : 'don'
            const payment = t.payment_method === 'CASH' ? 'espèces' : t.payment_method === 'CARD' ? 'carte' : ''
            const date = new Date(t.created_at).toLocaleDateString('fr-FR')

            return (
                productName.includes(searchLower) ||
                variant.includes(searchLower) ||
                comment.includes(searchLower) ||
                type.includes(searchLower) ||
                payment.includes(searchLower) ||
                date.includes(searchLower)
            )
        })

        onFilteredTransactions(filtered)
    }, [search, transactions, onFilteredTransactions])

    // Calculate stats per product/variant
    const productStats = useMemo(() => {
        const statsMap = new Map<string, ProductStats>()

        transactions.forEach(t => {
            const productId = t.product_id
            const productName = t.products?.name || 'Produit inconnu'

            if (!statsMap.has(productId)) {
                statsMap.set(productId, {
                    productId,
                    productName,
                    variants: [],
                    totalSalesCount: 0,
                    totalSalesQuantity: 0,
                    totalSalesAmount: 0,
                    totalGiftsCount: 0,
                    totalGiftsQuantity: 0,
                })
            }

            const stats = statsMap.get(productId)!
            const variantId = t.variant_id
            const variantLabel = t.product_variants
                ? [t.product_variants.size, t.product_variants.color].filter(Boolean).join(' / ') || 'Variante'
                : 'Sans variante'

            // Find or create variant stat
            let variantStat = stats.variants.find(v => v.variantId === variantId)
            if (!variantStat) {
                variantStat = {
                    variantId,
                    label: variantLabel,
                    salesCount: 0,
                    salesQuantity: 0,
                    salesAmount: 0,
                    giftsCount: 0,
                    giftsQuantity: 0,
                }
                stats.variants.push(variantStat)
            }

            // Update counts
            if (t.type === 'SALE') {
                variantStat.salesCount++
                variantStat.salesQuantity += t.quantity
                variantStat.salesAmount += Number(t.amount)
                stats.totalSalesCount++
                stats.totalSalesQuantity += t.quantity
                stats.totalSalesAmount += Number(t.amount)
            } else {
                variantStat.giftsCount++
                variantStat.giftsQuantity += t.quantity
                stats.totalGiftsCount++
                stats.totalGiftsQuantity += t.quantity
            }
        })

        // Sort by total sales quantity (descending)
        return Array.from(statsMap.values()).sort((a, b) => b.totalSalesQuantity - a.totalSalesQuantity)
    }, [transactions])

    // Total stats
    const totalStats = useMemo(() => {
        return productStats.reduce(
            (acc, p) => ({
                salesCount: acc.salesCount + p.totalSalesCount,
                salesQty: acc.salesQty + p.totalSalesQuantity,
                salesAmount: acc.salesAmount + p.totalSalesAmount,
                giftsQty: acc.giftsQty + p.totalGiftsQuantity,
            }),
            { salesCount: 0, salesQty: 0, salesAmount: 0, giftsQty: 0 }
        )
    }, [productStats])

    return (
        <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Rechercher par produit, commentaire, date..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant={showStats ? "default" : "outline"}
                    onClick={() => setShowStats(!showStats)}
                    className="gap-2"
                >
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Statistiques</span>
                    {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {/* Product Stats */}
            {showStats && productStats.length > 0 && (
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    {/* Header with totals */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-4 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Statistiques par produit
                            </h3>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
                                    <ShoppingBag className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold">{totalStats.salesQty} vendus</span>
                                </div>
                                <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
                                    <Euro className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-600">{totalStats.salesAmount.toFixed(2)} €</span>
                                </div>
                                {totalStats.giftsQty > 0 && (
                                    <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
                                        <Gift className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold text-blue-600">{totalStats.giftsQty} donnés</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products list */}
                    <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y">
                            {productStats.map((product, index) => (
                                <div key={product.productId} className="p-4 hover:bg-muted/30 transition-colors">
                                    {/* Product header */}
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="font-semibold truncate">{product.productName}</span>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">{product.totalSalesAmount.toFixed(2)} €</div>
                                                <div className="text-xs text-muted-foreground">{product.totalSalesQuantity} vendus</div>
                                            </div>
                                            {product.totalGiftsQuantity > 0 && (
                                                <div className="text-right pl-3 border-l">
                                                    <div className="text-lg font-bold text-blue-600">{product.totalGiftsQuantity}</div>
                                                    <div className="text-xs text-muted-foreground">dons</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Variants (only if more than 1) */}
                                    {product.variants.length > 1 && (
                                        <div className="ml-11 mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {product.variants.map((variant) => (
                                                <div
                                                    key={`${product.productId}-${variant.variantId}`}
                                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm"
                                                >
                                                    <span className="text-muted-foreground truncate">{variant.label}</span>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="font-medium text-green-600">{variant.salesQuantity}</span>
                                                        {variant.giftsQuantity > 0 && (
                                                            <span className="font-medium text-blue-600">+{variant.giftsQuantity} 🎁</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-muted/30 px-4 py-2 border-t text-xs text-muted-foreground text-center">
                        {productStats.length} produit{productStats.length > 1 ? 's' : ''} • Trié par quantité vendue
                    </div>
                </div>
            )}
        </div>
    )
}
