'use client'

import { useState, useTransition } from 'react'
import { clearTransactionHistory } from '@/app/actions'
import { Button } from '@/components/ui/button'
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
import { Trash2, Loader2 } from 'lucide-react'

interface ClearHistoryButtonProps {
    projectId: string
}

export function ClearHistoryButton({ projectId }: ClearHistoryButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleClear = () => {
        startTransition(async () => {
            const result = await clearTransactionHistory(projectId)
            if (result.message === 'Historique vidé avec succès') {
                setOpen(false)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider l'historique
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ Vider l'historique ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Toutes les transactions de ce projet seront définitivement supprimées.
                        Les statistiques et exports seront perdus.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleClear}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirmer la suppression
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
