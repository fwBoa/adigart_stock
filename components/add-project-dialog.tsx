'use client'

import { useState, useActionState } from 'react'
import { createProject, CreateProjectState } from '@/app/actions'
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

const initialState: CreateProjectState = {
    message: '',
    errors: {}
}

export function AddProjectDialog() {
    const [open, setOpen] = useState(false)
    const [state, action, isPending] = useActionState(createProject, initialState)

    // Close dialog on success
    if (state.message === 'Projet créé avec succès' && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un projet</DialogTitle>
                    <DialogDescription>
                        Ajoutez un nouvel événement pour gérer son stock.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nom
                        </Label>
                        <div className="col-span-3">
                            <Input id="name" name="name" placeholder="Ex: Festival Été 2025" required />
                            {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                            Début
                        </Label>
                        <Input id="startDate" name="startDate" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                            Fin
                        </Label>
                        <Input id="endDate" name="endDate" type="date" className="col-span-3" />
                    </div>

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
