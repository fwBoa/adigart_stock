'use client'

import { toggleProjectArchive } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'

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
                <DropdownMenuSeparator />
                <DeleteProjectDialog
                    projectId={projectId}
                    projectName={projectName}
                    trigger={
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                    }
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
