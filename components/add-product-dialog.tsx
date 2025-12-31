'use client'

import { useState, useActionState, startTransition, useTransition } from 'react'
import { createProduct, CreateProductState } from '@/app/actions'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from 'lucide-react'

const initialState: CreateProductState = {
    message: '',
    errors: {}
}

type Category = {
    id: string
    name: string
}

export function AddProductDialog({ categories, projectId }: { categories: Category[], projectId: string }) {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(createProduct, initialState)

    // Close dialog on success (when message is "Produit créé avec succès")
    if (state.message === 'Produit créé avec succès' && open) {
        setOpen(false)
        // Optional: reset state if needed, or rely on key change
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un produit</DialogTitle>
                    <DialogDescription>
                        Créez un nouveau produit dans votre inventaire.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <input type="hidden" name="projectId" value={projectId} />
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nom
                        </Label>
                        <div className="col-span-3">
                            <Input id="name" name="name" className="col-span-3" required />
                            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">
                            SKU
                        </Label>
                        <Input id="sku" name="sku" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Prix
                        </Label>
                        <div className="col-span-3">
                            <Input id="price" name="price" type="number" step="0.01" min="0" className="col-span-3" defaultValue={0} />
                            {state.errors?.price && <p className="text-sm text-red-500">{state.errors.price}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                            Stock
                        </Label>
                        <div className="col-span-3">
                            <Input id="stock" name="stock" type="number" min="0" className="col-span-3" defaultValue={0} />
                            {state.errors?.stock && <p className="text-sm text-red-500">{state.errors.stock}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Catégorie
                        </Label>
                        <div className="col-span-3">
                            <Select name="categoryId">
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                            Image
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Optionnel. JPG, PNG ou WebP (max 2 Mo)
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
