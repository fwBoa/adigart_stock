'use client'

import { useState, useTransition } from 'react'
import { updateTransaction, deleteTransactionAction } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Pencil, Trash2, Banknote, CreditCard, ShoppingCart, Gift } from 'lucide-react'

type Transaction = {
    id: string
    product_id: string
    variant_id: string | null
    type: 'SALE' | 'GIFT'
    payment_method: 'CASH' | 'CARD' | null
    quantity: number
    amount: number
    comment: string | null
    created_at: string
    products?: { name: string }
}

interface EditTransactionDialogProps {
    transaction: Transaction
    projectId: string
}

export function EditTransactionDialog({ transaction, projectId }: EditTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()
    const [error, setError] = useState('')

    const [type, setType] = useState<'SALE' | 'GIFT'>(transaction.type)
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>(
        transaction.payment_method || 'CASH'
    )
    const [quantity, setQuantity] = useState(transaction.quantity)
    const [amount, setAmount] = useState(transaction.amount)
    const [comment, setComment] = useState(transaction.comment || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        startTransition(async () => {
            const result = await updateTransaction(transaction.id, projectId, {
                quantity,
                amount: type === 'GIFT' ? 0 : amount,
                paymentMethod: type === 'SALE' ? paymentMethod : null,
                type,
                comment: comment || null,
            })

            if (result.success) {
                setOpen(false)
            } else {
                setError(result.message || 'Erreur')
            }
        })
    }

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteTransactionAction(transaction.id, projectId)
            if (result.success) {
                setOpen(false)
            } else {
                setError(result.message || 'Erreur')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier la transaction</DialogTitle>
                    <DialogDescription>
                        {transaction.products?.name} — {new Date(transaction.created_at).toLocaleString('fr-FR')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setType('SALE')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${type === 'SALE'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-muted hover:border-green-300'
                                }`}
                        >
                            <ShoppingCart className={`h-5 w-5 ${type === 'SALE' ? 'text-green-600' : 'text-muted-foreground'}`} />
                            <span className={type === 'SALE' ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                Vente
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('GIFT')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${type === 'GIFT'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-muted hover:border-blue-300'
                                }`}
                        >
                            <Gift className={`h-5 w-5 ${type === 'GIFT' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                            <span className={type === 'GIFT' ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                                Don
                            </span>
                        </button>
                    </div>

                    {/* Payment Method (only for SALE) */}
                    {type === 'SALE' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CASH')}
                                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${paymentMethod === 'CASH'
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                        : 'border-muted hover:border-amber-300'
                                    }`}
                            >
                                <Banknote className={`h-4 w-4 ${paymentMethod === 'CASH' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                                <span className={`text-sm ${paymentMethod === 'CASH' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    Espèces
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CARD')}
                                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${paymentMethod === 'CARD'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-muted hover:border-purple-300'
                                    }`}
                            >
                                <CreditCard className={`h-4 w-4 ${paymentMethod === 'CARD' ? 'text-purple-600' : 'text-muted-foreground'}`} />
                                <span className={`text-sm ${paymentMethod === 'CARD' ? 'text-purple-600' : 'text-muted-foreground'}`}>
                                    Carte
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantité</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                required
                            />
                        </div>
                        {type === 'SALE' && (
                            <div className="space-y-2">
                                <Label htmlFor="amount">Montant (€)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Commentaire</Label>
                        <Input
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Optionnel"
                            maxLength={255}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <DialogFooter className="flex justify-between gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="sm" disabled={isPending || isDeleting}>
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                    Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette transaction ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Le stock sera restauré automatiquement. Cette action est irréversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isPending || isDeleting}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sauvegarder
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
