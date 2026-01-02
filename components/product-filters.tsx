'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, ProductTableRow } from '@/components/product-row'

type Product = {
    id: string
    name: string
    sku: string | null
    price: number
    stock: number
    image_url: string | null
    category_id: string | null
}

type Category = {
    id: string
    name: string
}

type Variant = {
    id: string
    product_id: string
    size: string | null
    color: string | null
    stock: number
    sku: string | null
}

interface ProductFiltersProps {
    products: Product[]
    categories: Category[]
    variants: Variant[]
    projectId: string
}

export function ProductFilters({ products, categories, variants, projectId }: ProductFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [stockFilter, setStockFilter] = useState<string>('all')

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))

            // Category filter
            const matchesCategory = selectedCategory === 'all' ||
                product.category_id === selectedCategory

            // Stock filter
            let matchesStock = true
            if (stockFilter === 'low') {
                matchesStock = product.stock > 0 && product.stock <= 5
            } else if (stockFilter === 'out') {
                matchesStock = product.stock === 0
            } else if (stockFilter === 'available') {
                matchesStock = product.stock > 5
            }

            return matchesSearch && matchesCategory && matchesStock
        })
    }, [products, searchQuery, selectedCategory, stockFilter])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('all')
        setStockFilter('all')
    }

    const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || stockFilter !== 'all'

    return (
        <div>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Stock Filter */}
                <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tout stock</SelectItem>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="low">Stock bas</SelectItem>
                        <SelectItem value="out">Rupture</SelectItem>
                    </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                        <X className="h-4 w-4 mr-1" />
                        Effacer
                    </Button>
                )}
            </div>

            {/* Results Count */}
            {hasActiveFilters && (
                <p className="text-sm text-muted-foreground mb-4">
                    {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Products */}
            {filteredProducts.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                    {hasActiveFilters
                        ? 'Aucun produit ne correspond aux filtres.'
                        : 'Aucun produit dans ce projet.'}
                </div>
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} projectId={projectId} categories={categories} variants={variants.filter(v => v.product_id === product.id)} />
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr className="text-left">
                                        <th className="p-4 font-medium text-muted-foreground">Produit</th>
                                        <th className="p-4 font-medium text-muted-foreground">SKU</th>
                                        <th className="p-4 font-medium text-muted-foreground">Prix</th>
                                        <th className="p-4 font-medium text-muted-foreground text-right">Stock</th>
                                        <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredProducts.map((product) => (
                                        <ProductTableRow key={product.id} product={product} projectId={projectId} categories={categories} variants={variants.filter(v => v.product_id === product.id)} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
