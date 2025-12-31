'use client'

import { useState, useActionState } from 'react'
import { createCategory, CategoryState } from '@/app/actions'
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

const initialState: CategoryState = {
    message: '',
    errors: {}
}

export function AddCategoryDialog() {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(createCategory, initialState)

    if (state.message === 'Catégorie créée avec succès' && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Catégorie
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Créer une catégorie</DialogTitle>
                    <DialogDescription>
                        Les catégories permettent d'organiser vos produits.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Boissons, Snacks, Merch..."
                            required
                        />
                        {state.errors?.name && (
                            <p className="text-sm text-red-500">{state.errors.name}</p>
                        )}
                    </div>

                    {state.message && state.message !== 'Catégorie créée avec succès' && (
                        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                            {state.message}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
