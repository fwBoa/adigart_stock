import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart, Gift, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TransactionsPageProps {
    params: {
        id: string
    }
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
    const { id } = await params
    const supabase = await createClient()

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
                        <a href={`/api/projects/${id}/export`} download>
                            <Button variant="outline">
                                Exporter CSV
                            </Button>
                        </a>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            {new Date(transaction.created_at).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-4 font-medium">{transaction.products?.name}</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}
