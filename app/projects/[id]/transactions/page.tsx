import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart, Gift, MessageSquare } from 'lucide-react'
import { ClearHistoryButton } from '@/components/clear-history-button'
import { EditTransactionDialog } from '@/components/edit-transaction-dialog'
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
    const totalItems = transactions?.reduce((sum, t) => sum + t.quantity, 0) || 0

    // Group transactions by sale_group_id for visual grouping
    const groupColors = new Map<string, string>()
    const colorPalette = [
        'bg-blue-50 dark:bg-blue-900/10',
        'bg-purple-50 dark:bg-purple-900/10',
        'bg-pink-50 dark:bg-pink-900/10',
        'bg-orange-50 dark:bg-orange-900/10',
        'bg-teal-50 dark:bg-teal-900/10',
    ]
    let colorIndex = 0

    transactions?.forEach(t => {
        if (t.sale_group_id && !groupColors.has(t.sale_group_id)) {
            groupColors.set(t.sale_group_id, colorPalette[colorIndex % colorPalette.length])
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                    <p className="text-2xl font-bold text-green-600">{totalSales.toFixed(2)} €</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">💵 Espèces</p>
                    <p className="text-2xl font-bold text-amber-600">{cashTotal.toFixed(2)} €</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">💳 Carte</p>
                    <p className="text-2xl font-bold text-purple-600">{cardTotal.toFixed(2)} €</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Ventes</p>
                    <p className="text-2xl font-bold">{salesCount}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Dons</p>
                    <p className="text-2xl font-bold">{giftsCount}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Articles</p>
                    <p className="text-2xl font-bold">{totalItems}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                {!transactions || transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Aucune transaction pour ce projet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-medium text-muted-foreground">Date</th>
                                    <th className="p-4 font-medium text-muted-foreground">Produit</th>
                                    <th className="p-4 font-medium text-muted-foreground">Type</th>
                                    <th className="p-4 font-medium text-muted-foreground">Paiement</th>
                                    <th className="p-4 font-medium text-muted-foreground text-right">Qté</th>
                                    <th className="p-4 font-medium text-muted-foreground text-right">Montant</th>
                                    <th className="p-4 font-medium text-muted-foreground">Commentaire</th>
                                    {isAdmin && <th className="p-4 font-medium text-muted-foreground text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.map((transaction) => {
                                    const groupBg = transaction.sale_group_id ? groupColors.get(transaction.sale_group_id) : ''
                                    return (
                                        <tr
                                            key={transaction.id}
                                            className={`hover:bg-muted/50 transition-colors ${groupBg}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {transaction.sale_group_id && (
                                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary" title="Panier groupé">
                                                            🛒
                                                        </span>
                                                    )}
                                                    {new Date(transaction.created_at).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">
                                                <div>{transaction.products?.name}</div>
                                                {transaction.product_variants && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {transaction.product_variants.size || ''}
                                                        {transaction.product_variants.size && transaction.product_variants.color ? ' / ' : ''}
                                                        {transaction.product_variants.color || ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'SALE'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {transaction.type === 'SALE' ? (
                                                        <><ShoppingCart className="h-3 w-3" /> Vente</>
                                                    ) : (
                                                        <><Gift className="h-3 w-3" /> Don</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {transaction.type === 'SALE' && transaction.payment_method && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${transaction.payment_method === 'CASH'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}>
                                                        {transaction.payment_method === 'CASH' ? 'Espèces' : 'Carte'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">{transaction.quantity}</td>
                                            <td className="p-4 text-right font-medium">
                                                {Number(transaction.amount).toFixed(2)} €
                                            </td>
                                            <td className="p-4 max-w-[150px]">
                                                {transaction.comment && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MessageSquare className="h-3 w-3 shrink-0" />
                                                        <span className="truncate" title={transaction.comment}>{transaction.comment}</span>
                                                    </div>
                                                )}
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4 text-center">
                                                    <EditTransactionDialog
                                                        transaction={transaction}
                                                        projectId={id}
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}
