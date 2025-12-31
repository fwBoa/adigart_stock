'use client'

import { useState, useActionState } from 'react'
import { restockProduct, RestockState } from '@/app/actions'
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
import { Loader2, PackagePlus } from 'lucide-react'

const initialState: RestockState = {
    message: '',
    errors: {}
}

type Product = {
    id: string
    name: string
    stock: number
}

export function RestockDialog({ product }: { product: Product }) {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(restockProduct, initialState)

    if (state.message === 'Stock mis à jour' && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <PackagePlus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <DialogTitle>Réapprovisionner</DialogTitle>
                    <DialogDescription>
                        {product.name} (Stock actuel: {product.stock})
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <input type="hidden" name="productId" value={product.id} />

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité à ajouter</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            defaultValue="1"
                            required
                        />
                        {state.errors?.quantity && (
                            <p className="text-sm text-red-500">{state.errors.quantity}</p>
                        )}
                    </div>

                    {state.message && state.message !== 'Stock mis à jour' && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {state.message}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ajouter au stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
