'use client'

import { useState, useTransition } from 'react'
import { createVariant } from '@/app/actions'
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
import { Loader2, Plus } from 'lucide-react'

interface AddVariantDialogProps {
    productId: string
    productName: string
    projectId: string
    productStock: number
    currentVariantsTotal: number
}

export function AddVariantDialog({ productId, productName, projectId, productStock, currentVariantsTotal }: AddVariantDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [size, setSize] = useState('')
    const [color, setColor] = useState('')
    const [stock, setStock] = useState(0)
    const [sku, setSku] = useState('')
    const [error, setError] = useState('')

    const remainingStock = productStock - currentVariantsTotal
    const maxStock = Math.max(0, remainingStock)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (stock > remainingStock) {
            setError(`Maximum disponible: ${remainingStock}`)
            return
        }

        startTransition(async () => {
            const result = await createVariant(productId, projectId, {
                size: size || undefined,
                color: color || undefined,
                stock,
                sku: sku || undefined,
            })

            if (result.message === 'Variante créée') {
                setOpen(false)
                setSize('')
                setColor('')
                setStock(0)
                setSku('')
                setError('')
            } else {
                setError(result.message || 'Erreur')
            }
        })
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            setError('')
            setStock(0)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8" disabled={remainingStock <= 0}>
                    <Plus className="h-3 w-3 mr-1" />
                    Variante
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une variante</DialogTitle>
                    <DialogDescription>
                        {productName} — Stock restant à répartir: <strong>{remainingStock}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Taille</Label>
                            <Input
                                id="size"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="S, M, L, XL..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Couleur</Label>
                            <Input
                                id="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="Rouge, Bleu..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock * (max: {maxStock})</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                max={maxStock}
                                value={stock}
                                onChange={(e) => setStock(Math.min(Number(e.target.value), maxStock))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU (optionnel)</Label>
                            <Input
                                id="sku"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="REF-001"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending || stock <= 0 || stock > maxStock}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
