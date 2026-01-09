'use client'

import { useState, useTransition } from 'react'
import { createVariant } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Layers } from 'lucide-react'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const

interface BulkVariantDialogProps {
    productId: string
    productName: string
    projectId: string
    productStock: number
    currentVariantsTotal: number
}

type SizeStock = {
    [key: string]: { checked: boolean; stock: number }
}

export function BulkVariantDialog({ productId, productName, projectId, productStock, currentVariantsTotal }: BulkVariantDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [color, setColor] = useState('')
    const [sizeStocks, setSizeStocks] = useState<SizeStock>(
        SIZES.reduce((acc, size) => ({ ...acc, [size]: { checked: false, stock: 0 } }), {})
    )
    const [error, setError] = useState('')

    const remainingStock = productStock - currentVariantsTotal

    // Calculate total selected stock
    const totalSelectedStock = Object.values(sizeStocks)
        .filter(s => s.checked)
        .reduce((sum, s) => sum + s.stock, 0)

    const selectedCount = Object.values(sizeStocks).filter(s => s.checked && s.stock > 0).length

    const toggleSize = (size: string) => {
        setSizeStocks(prev => ({
            ...prev,
            [size]: { ...prev[size], checked: !prev[size].checked }
        }))
    }

    const updateStock = (size: string, stock: number) => {
        setSizeStocks(prev => ({
            ...prev,
            [size]: { ...prev[size], stock: Math.max(0, stock) }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (totalSelectedStock > remainingStock) {
            setError(`Stock total (${totalSelectedStock}) dépasse le disponible (${remainingStock})`)
            return
        }

        if (selectedCount === 0) {
            setError('Sélectionnez au moins une taille avec du stock')
            return
        }

        startTransition(async () => {
            const variantsToCreate = Object.entries(sizeStocks)
                .filter(([_, data]) => data.checked && data.stock > 0)
                .map(([size, data]) => ({ size, stock: data.stock }))

            let successCount = 0
            let lastError = ''

            for (const variant of variantsToCreate) {
                const result = await createVariant(productId, projectId, {
                    size: variant.size,
                    color: color || undefined,
                    stock: variant.stock,
                })

                if (result.message?.includes('Variante créée')) {
                    successCount++
                } else {
                    lastError = result.message || 'Erreur'
                }
            }

            if (successCount === variantsToCreate.length) {
                setOpen(false)
                setColor('')
                setSizeStocks(SIZES.reduce((acc, size) => ({ ...acc, [size]: { checked: false, stock: 0 } }), {}))
                setError('')
            } else if (successCount > 0) {
                setError(`${successCount}/${variantsToCreate.length} variantes créées. Erreur: ${lastError}`)
            } else {
                setError(lastError)
            }
        })
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            setError('')
            setSizeStocks(SIZES.reduce((acc, size) => ({ ...acc, [size]: { checked: false, stock: 0 } }), {}))
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <Layers className="h-3 w-3 mr-1" />
                    Lot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Ajouter plusieurs variantes</DialogTitle>
                    <DialogDescription>
                        {productName} — Stock restant: <strong>{remainingStock}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="color">Couleur (optionnel)</Label>
                        <Input
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="Noir, Blanc, Rouge..."
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Tailles et stocks</Label>
                        <div className="space-y-2">
                            {SIZES.map(size => (
                                <div key={size} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`size-${size}`}
                                        checked={sizeStocks[size].checked}
                                        onCheckedChange={() => toggleSize(size)}
                                    />
                                    <Label
                                        htmlFor={`size-${size}`}
                                        className="flex-1 font-medium cursor-pointer"
                                    >
                                        {size}
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={sizeStocks[size].stock || ''}
                                        onChange={(e) => updateStock(size, Number(e.target.value))}
                                        placeholder="0"
                                        className="w-20 h-8 text-center"
                                        disabled={!sizeStocks[size].checked}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className={`p-3 rounded-lg text-sm ${totalSelectedStock > remainingStock ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-muted'}`}>
                        <div className="flex justify-between">
                            <span>Total sélectionné:</span>
                            <span className="font-medium">{totalSelectedStock} / {remainingStock}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Variantes à créer:</span>
                            <span className="font-medium">{selectedCount}</span>
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
                        <Button
                            type="submit"
                            disabled={isPending || selectedCount === 0 || totalSelectedStock > remainingStock}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer {selectedCount} variante{selectedCount > 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
