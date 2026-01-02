'use client'

import { useState } from 'react'
import { deleteProject } from '@/app/actions'
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
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useTransition } from 'react'

interface DeleteProjectDialogProps {
    projectId: string
    projectName: string
    trigger?: React.ReactNode
}

export function DeleteProjectDialog({ projectId, projectName, trigger }: DeleteProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [isPending, startTransition] = useTransition()

    const isConfirmed = confirmText === 'DELETE'

    const handleDelete = () => {
        if (!isConfirmed) return

        startTransition(async () => {
            await deleteProject(projectId)
            setOpen(false)
            setConfirmText('')
        })
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setConfirmText('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Supprimer le projet
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Vous êtes sur le point de supprimer définitivement le projet
                        <strong className="text-foreground"> "{projectName}"</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
                    <p className="text-sm text-destructive font-medium mb-2">
                        ⚠️ Cette action est irréversible !
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Tous les produits et transactions associés seront également supprimés.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm">
                        Tapez <span className="font-mono font-bold text-destructive">DELETE</span> pour confirmer
                    </Label>
                    <Input
                        id="confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className={confirmText && !isConfirmed ? 'border-destructive' : ''}
                        autoComplete="off"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!isConfirmed || isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer définitivement
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
