'use client'

import { useState, useActionState, useEffect } from 'react'
import { updateProduct, UpdateProductState } from '@/app/actions'
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
import { Loader2, Pencil } from 'lucide-react'

type Product = {
    id: string
    name: string
    sku: string | null
    price: number
    stock: number
    category_id?: string | null
}

type Category = {
    id: string
    name: string
}

const initialState: UpdateProductState = {
    message: '',
    errors: {}
}

interface EditProductDialogProps {
    product: Product
    categories: Category[]
    projectId: string
}

export function EditProductDialog({ product, categories, projectId }: EditProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(updateProduct, initialState)

    useEffect(() => {
        if (state.message === 'Produit mis à jour' && open) {
            setOpen(false)
        }
    }, [state.message, open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le produit</DialogTitle>
                    <DialogDescription>
                        Modifiez les informations du produit.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="projectId" value={projectId} />

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nom</Label>
                        <div className="col-span-3">
                            <Input id="name" name="name" defaultValue={product.name} required />
                            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sku" className="text-right">SKU</Label>
                        <Input id="sku" name="sku" defaultValue={product.sku || ''} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Prix</Label>
                        <div className="col-span-3">
                            <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product.price} />
                            {state.errors?.price && <p className="text-sm text-red-500">{state.errors.price}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">Stock</Label>
                        <div className="col-span-3">
                            <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock} />
                            {state.errors?.stock && <p className="text-sm text-red-500">{state.errors.stock}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Catégorie</Label>
                        <div className="col-span-3">
                            <Select name="categoryId" defaultValue={product.category_id || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Aucune" />
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

                    {state.message && state.message !== 'Produit mis à jour' && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                            {state.message}
                        </div>
                    )}

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
