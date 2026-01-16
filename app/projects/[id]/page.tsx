import { createClient } from '@/lib/supabase/server'
import { ProductFilters } from '@/components/product-filters'
import { AddProductDialog } from '@/components/add-product-dialog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUserRole } from '@/app/user-actions'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart-drawer'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
    params: {
        id: string
    }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Get user role
    const role = await getCurrentUserRole()
    const isAdmin = role === 'admin'

    // Fetch Project details first
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (projectError || !project) {
        notFound()
    }

    // Parallel fetching for products and categories
    const [productsResult, categoriesResult] = await Promise.all([
        supabase
            .from('products')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true })
    ])

    const products = productsResult.data
    const productError = productsResult.error
    const categories = categoriesResult.data || []

    // Fetch variants for these products
    let variants: any[] = []
    if (products && products.length > 0) {
        const productIds = products.map(p => p.id)
        const { data } = await supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds)

        if (data) {
            variants = data
        }
    }

    // Calculate stats
    const totalValue = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0
    const lowStockCount = products?.filter(p => p.stock <= 5 && p.stock > 0).length || 0
    const outOfStockCount = products?.filter(p => p.stock === 0).length || 0

    if (productError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                    Erreur: {productError.message}
                </div>
            </div>
        )
    }

    return (
        <CartProvider projectId={project.id}>
            <main className="container mx-auto px-4 py-6 md:py-10">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux projets
                        </Button>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h1>
                            <p className="text-muted-foreground mt-1">{products?.length || 0} produits</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <CartDrawer projectId={project.id} />
                            <Link href={`/projects/${id}/transactions`}>
                                <Button variant="outline">Historique</Button>
                            </Link>
                            {isAdmin && <AddProductDialog categories={categories} projectId={project.id} />}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
                    <div className="bg-card border rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <p className="text-sm text-muted-foreground">Produits</p>
                        <p className="text-2xl font-bold">{products?.length || 0}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <p className="text-sm text-muted-foreground">Valeur Stock</p>
                        <p className="text-2xl font-bold">{totalValue.toFixed(2)} €</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <p className="text-sm text-muted-foreground">Stock Bas</p>
                        <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-500' : ''}`}>{lowStockCount}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <p className="text-sm text-muted-foreground">Rupture</p>
                        <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-500' : ''}`}>{outOfStockCount}</p>
                    </div>
                </div>

                {/* Products with Filters */}
                {!products || products.length === 0 ? (
                    <div className="rounded-lg border bg-card">
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-1">Aucun produit</h3>
                            <p className="text-muted-foreground mb-4">
                                Ajoutez votre premier produit pour commencer.
                            </p>
                            {isAdmin && <AddProductDialog categories={categories} projectId={project.id} />}
                        </div>
                    </div>
                ) : (
                    <ProductFilters products={products} categories={categories} variants={variants} projectId={project.id} isAdmin={isAdmin} />
                )}
            </main>
        </CartProvider>
    )
}
