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
}

export function AddVariantDialog({ productId, productName, projectId }: AddVariantDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [size, setSize] = useState('')
    const [color, setColor] = useState('')
    const [stock, setStock] = useState(0)
    const [sku, setSku] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

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
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <Plus className="h-3 w-3 mr-1" />
                    Variante
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une variante</DialogTitle>
                    <DialogDescription>
                        {productName}
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
                            <Label htmlFor="stock">Stock *</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending || stock < 0}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
