'use client'

import { useState, useCallback } from 'react'
import { TransactionSearch } from '@/components/transaction-search'
import { EditTransactionDialog } from '@/components/edit-transaction-dialog'
import { MessageSquare } from 'lucide-react'

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

interface TransactionTableClientProps {
    transactions: Transaction[]
    projectId: string
    isAdmin: boolean
    groupColors: Record<string, string>
}

export function TransactionTableClient({
    transactions,
    projectId,
    isAdmin,
    groupColors
}: TransactionTableClientProps) {
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)

    const handleFilteredTransactions = useCallback((filtered: Transaction[]) => {
        setFilteredTransactions(filtered)
    }, [])

    return (
        <>
            <TransactionSearch
                transactions={transactions}
                onFilteredTransactions={handleFilteredTransactions}
            />

            {/* Transactions Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        {transactions.length === 0
                            ? 'Aucune transaction pour ce projet.'
                            : 'Aucune transaction ne correspond à votre recherche.'}
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
                                {filteredTransactions.map((transaction) => {
                                    const groupBg = transaction.sale_group_id ? groupColors[transaction.sale_group_id] || '' : ''
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
                                                        {transaction.product_variants.size && transaction.product_variants.color && ' / '}
                                                        {transaction.product_variants.color || ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${transaction.type === 'SALE'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {transaction.type === 'SALE' ? '💰 Vente' : '🎁 Don'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {transaction.type === 'SALE' && (
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${transaction.payment_method === 'CASH'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}>
                                                        {transaction.payment_method === 'CASH' ? '💵 Espèces' : '💳 Carte'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-medium">{transaction.quantity}</td>
                                            <td className="p-4 text-right font-bold text-green-600">
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
                                                        projectId={projectId}
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

            {/* Results count when filtered */}
            {filteredTransactions.length !== transactions.length && filteredTransactions.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                    {filteredTransactions.length} résultat{filteredTransactions.length > 1 ? 's' : ''} sur {transactions.length} transactions
                </p>
            )}
        </>
    )
}
