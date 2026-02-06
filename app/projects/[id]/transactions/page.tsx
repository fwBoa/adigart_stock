import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ClearHistoryButton } from '@/components/clear-history-button'
import { TransactionTableClient } from '@/components/transaction-table-client'
import { getCurrentUserRole } from '@/app/user-actions'

export const dynamic = 'force-dynamic'

interface TransactionsPageProps {
    params: {
        id: string
    }
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
    const { id } = await params
    const supabase = await createClient()
    const userRole = await getCurrentUserRole()
    const isAdmin = userRole === 'admin'

    // Fetch project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (projectError || !project) {
        notFound()
    }

    // Fetch transactions with product info
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
      *,
      products!inner (
        id,
        name,
        price,
        project_id
      ),
      product_variants (
        id,
        size,
        color
      )
    `)
        .eq('products.project_id', id)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="text-destructive">Erreur: {error.message}</div>
            </div>
        )
    }

    // Calculate stats
    const totalSales = transactions?.filter(t => t.type === 'SALE').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const cashTotal = transactions?.filter(t => t.type === 'SALE' && t.payment_method === 'CASH').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const cardTotal = transactions?.filter(t => t.type === 'SALE' && t.payment_method === 'CARD').reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const salesCount = transactions?.filter(t => t.type === 'SALE').length || 0
    const giftsCount = transactions?.filter(t => t.type === 'GIFT').length || 0
    const giftsArticles = transactions?.filter(t => t.type === 'GIFT').reduce((sum, t) => sum + t.quantity, 0) || 0
    const totalItems = transactions?.reduce((sum, t) => sum + t.quantity, 0) || 0

    // Calculate estimated gift value (what gifts would have been worth if sold)
    const giftsValue = transactions?.filter(t => t.type === 'GIFT').reduce((sum, t) => {
        const unitPrice = t.products?.price || 0
        return sum + (Number(unitPrice) * t.quantity)
    }, 0) || 0

    // Average basket (panier moyen)
    const averageBasket = salesCount > 0 ? totalSales / salesCount : 0

    // Daily breakdown by payment method
    const dailyStats: Record<string, { cash: number; card: number; date: string }> = {}
    transactions?.filter(t => t.type === 'SALE').forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })
        if (!dailyStats[date]) {
            dailyStats[date] = { cash: 0, card: 0, date }
        }
        if (t.payment_method === 'CASH') {
            dailyStats[date].cash += Number(t.amount)
        } else if (t.payment_method === 'CARD') {
            dailyStats[date].card += Number(t.amount)
        }
    })
    const dailyBreakdown = Object.values(dailyStats).reverse() // Most recent first

    // Group transactions by sale_group_id for visual grouping
    const groupColors: Record<string, string> = {}
    const colorPalette = [
        'bg-blue-50 dark:bg-blue-900/10',
        'bg-purple-50 dark:bg-purple-900/10',
        'bg-pink-50 dark:bg-pink-900/10',
        'bg-orange-50 dark:bg-orange-900/10',
        'bg-teal-50 dark:bg-teal-900/10',
    ]
    let colorIndex = 0

    transactions?.forEach(t => {
        if (t.sale_group_id && !groupColors[t.sale_group_id]) {
            groupColors[t.sale_group_id] = colorPalette[colorIndex % colorPalette.length]
            colorIndex++
        }
    })

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <div className="mb-6">
                <Link href={`/projects/${id}`}>
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à l'inventaire
                    </Button>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Historique - {project.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">{transactions?.length || 0} transactions</p>
                    </div>
                    {transactions && transactions.length > 0 && (
                        <div className="flex gap-2">
                            <a href={`/api/projects/${id}/export`} download>
                                <Button variant="outline">
                                    Exporter CSV
                                </Button>
                            </a>
                            <ClearHistoryButton projectId={id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-4 mb-6">
                {/* Row 1: Financial stats (4 cards) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">Chiffre d'Affaires</p>
                        <p className="text-2xl font-bold text-green-600">{totalSales.toFixed(2)} €</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">💵 Espèces</p>
                        <p className="text-2xl font-bold text-amber-600">{cashTotal.toFixed(2)} €</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">💳 Carte</p>
                        <p className="text-2xl font-bold text-purple-600">{cardTotal.toFixed(2)} €</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">🛒 Panier moyen</p>
                        <p className="text-2xl font-bold text-primary">{averageBasket.toFixed(2)} €</p>
                    </div>
                </div>

                {/* Row 2: Counts (3 cards) */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground">Ventes</p>
                        <p className="text-2xl font-bold">{salesCount}</p>
                        <p className="text-xs text-muted-foreground">transactions</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground">🎁 Dons</p>
                        <p className="text-2xl font-bold text-blue-600">{giftsArticles} <span className="text-sm font-normal">articles</span></p>
                        <p className="text-xs text-blue-500">≈ {giftsValue.toFixed(2)} € de valeur</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground">📦 Articles</p>
                        <p className="text-2xl font-bold">{totalItems}</p>
                        <p className="text-xs text-muted-foreground">pièces sorties</p>
                    </div>
                </div>

                {/* Row 3: Daily breakdown */}
                {dailyBreakdown.length > 0 && (
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-sm font-semibold mb-3">📅 Détail par jour</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {dailyBreakdown.slice(0, 7).map((day) => (
                                <div key={day.date} className="bg-muted/50 rounded-lg p-3 text-center">
                                    <p className="text-xs font-semibold mb-2">{day.date}</p>
                                    <div className="space-y-1">
                                        <p className="text-sm text-amber-600 font-medium">💵 {day.cash.toFixed(0)} €</p>
                                        <p className="text-sm text-purple-600 font-medium">💳 {day.card.toFixed(0)} €</p>
                                        <p className="text-xs text-green-600 font-bold border-t border-border pt-1 mt-1">{(day.cash + day.card).toFixed(0)} €</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions Table with Search */}
            <TransactionTableClient
                transactions={transactions || []}
                projectId={id}
                isAdmin={isAdmin}
                groupColors={groupColors}
            />
        </main>
    )
}
