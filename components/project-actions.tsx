'use client'

import { deleteProject, toggleProjectArchive } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'

type ProjectActionsProps = {
    projectId: string
    projectName: string
    isArchived: boolean
}

export function ProjectActions({ projectId, projectName, isArchived }: ProjectActionsProps) {
    const [isPending, startTransition] = useTransition()

    const handleArchive = () => {
        startTransition(async () => {
            await toggleProjectArchive(projectId, !isArchived)
        })
    }

    const handleDelete = () => {
        if (confirm(`Supprimer définitivement le projet "${projectName}" ?\n\nCette action supprimera également tous les produits et transactions associés.`)) {
            startTransition(async () => {
                await deleteProject(projectId)
            })
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive}>
                    {isArchived ? (
                        <><ArchiveRestore className="h-4 w-4 mr-2" /> Désarchiver</>
                    ) : (
                        <><Archive className="h-4 w-4 mr-2" /> Archiver</>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
