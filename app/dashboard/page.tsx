import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Package, ShoppingCart, Gift, Wallet, CreditCard } from 'lucide-react'
import { SalesChart } from '@/components/sales-chart'
import { isAdmin } from '@/app/user-actions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Only admin can see global dashboard
    const admin = await isAdmin()
    if (!admin) {
        redirect('/')
    }

    // Fetch all projects
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('archived', false)

    const projectIds = projects?.map(p => p.id) || []

    // Fetch all transactions for active projects
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            *,
            products!inner (
                id,
                name,
                project_id
            )
        `)
        .in('products.project_id', projectIds)
        .order('created_at', { ascending: false })

    // Fetch all products
    const { data: products } = await supabase
        .from('products')
        .select('id, name, stock, price')
        .in('project_id', projectIds)

    // Calculate global stats
    const totalSales = transactions?.filter(t => t.type === 'SALE').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const cashTotal = transactions?.filter(t => t.type === 'SALE' && t.payment_method === 'CASH').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const cardTotal = transactions?.filter(t => t.type === 'SALE' && t.payment_method === 'CARD').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const salesCount = transactions?.filter(t => t.type === 'SALE').length || 0
    const giftsCount = transactions?.filter(t => t.type === 'GIFT').length || 0
    const totalItems = transactions?.reduce((sum, t) => sum + t.quantity, 0) || 0
    const totalProducts = products?.length || 0
    const lowStockCount = products?.filter(p => p.stock <= 5 && p.stock > 0).length || 0
    const outOfStockCount = products?.filter(p => p.stock === 0).length || 0

    // Aggregate transactions by date for chart
    const salesByDay = transactions
        ?.filter(t => t.type === 'SALE')
        .reduce((acc: Record<string, number>, t) => {
            const date = new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
            acc[date] = (acc[date] || 0) + Number(t.amount)
            return acc
        }, {}) || {}

    const chartData = Object.entries(salesByDay)
        .map(([date, amount]) => ({ date, amount }))
        .slice(-14) // Last 14 days

    // Top selling products
    const productSales = transactions?.reduce((acc: Record<string, { name: string, quantity: number }>, t) => {
        const productId = t.product_id
        const productName = t.products?.name || 'Inconnu'
        if (!acc[productId]) {
            acc[productId] = { name: productName, quantity: 0 }
        }
        acc[productId].quantity += t.quantity
        return acc
    }, {}) || {}

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux projets
                    </Button>
                </Link>

                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Dashboard Global
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Statistiques globales de tous les projets actifs
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Ventes Totales</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{totalSales.toFixed(2)} €</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Transactions</p>
                    </div>
                    <p className="text-2xl font-bold">{salesCount + giftsCount}</p>
                    <p className="text-xs text-muted-foreground">{salesCount} ventes, {giftsCount} dons</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Espèces</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{cashTotal.toFixed(2)} €</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-purple-500" />
                        <p className="text-sm text-muted-foreground">Carte</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{cardTotal.toFixed(2)} €</p>
                </div>
            </div>

            {/* Second row stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Produits</p>
                    </div>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Articles vendus</p>
                    <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Stock bas</p>
                    <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-500' : ''}`}>{lowStockCount}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Rupture</p>
                    <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-500' : ''}`}>{outOfStockCount}</p>
                </div>
            </div>

            {/* Charts and Top Products */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-card border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Évolution des ventes</h2>
                    {chartData.length > 0 ? (
                        <SalesChart data={chartData} />
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Aucune vente à afficher</p>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-card border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Produits les plus vendus</h2>
                    {topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-muted text-muted-foreground'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{product.quantity} vendus</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Aucune vente</p>
                    )}
                </div>
            </div>

            {/* Projects Summary */}
            <div className="mt-6 bg-card border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Projets actifs ({projects?.length || 0})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {projects?.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <p className="font-medium truncate">{project.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
