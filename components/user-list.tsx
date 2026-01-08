'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, deleteUser, assignUserToProject, removeUserFromProject, getUserAssignments } from '@/app/user-actions'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Crown, User, Trash2, Loader2, Plus } from 'lucide-react'

type UserProfile = {
    id: string
    email: string
    role: 'admin' | 'seller'
    created_at: string
}

type Project = {
    id: string
    name: string
}

interface UserListProps {
    users: UserProfile[]
    projects: Project[]
}

export function UserList({ users, projects }: UserListProps) {
    const [isPending, startTransition] = useTransition()
    const [expandedUser, setExpandedUser] = useState<string | null>(null)
    const [userAssignments, setUserAssignments] = useState<Record<string, string[]>>({})

    const handleToggleRole = (userId: string, currentRole: 'admin' | 'seller') => {
        const newRole = currentRole === 'admin' ? 'seller' : 'admin'
        if (confirm(`Changer le rôle de cet utilisateur en ${newRole === 'admin' ? 'Admin' : 'Vendeur'} ?`)) {
            startTransition(() => {
                updateUserRole(userId, newRole)
            })
        }
    }

    const handleDelete = (userId: string, email: string) => {
        if (confirm(`⚠️ Supprimer l'utilisateur ${email} ?\n\nCette action est irréversible.`)) {
            startTransition(() => {
                deleteUser(userId)
            })
        }
    }

    const handleExpandUser = async (userId: string) => {
        if (expandedUser === userId) {
            setExpandedUser(null)
            return
        }

        setExpandedUser(userId)

        // Fetch user's assignments
        const assignments = await getUserAssignments(userId)
        setUserAssignments(prev => ({ ...prev, [userId]: assignments }))
    }

    const handleAssignProject = (userId: string, projectId: string) => {
        startTransition(async () => {
            await assignUserToProject(userId, projectId)
            const assignments = await getUserAssignments(userId)
            setUserAssignments(prev => ({ ...prev, [userId]: assignments }))
        })
    }

    const handleRemoveAssignment = (userId: string, projectId: string) => {
        startTransition(async () => {
            await removeUserFromProject(userId, projectId)
            const assignments = await getUserAssignments(userId)
            setUserAssignments(prev => ({ ...prev, [userId]: assignments }))
        })
    }

    if (users.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Aucun utilisateur trouvé.
            </div>
        )
    }

    return (
        <div className="divide-y">
            {users.map((user) => {
                const isExpanded = expandedUser === user.id
                const assignments = userAssignments[user.id] || []
                const assignedProjects = projects.filter(p => assignments.includes(p.id))
                const availableProjects = projects.filter(p => !assignments.includes(p.id))

                return (
                    <div key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'admin'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {user.role === 'admin' ? <Crown className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-medium">{user.email}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {user.role === 'admin' ? 'Administrateur' : 'Vendeur'}
                                        {user.role === 'seller' && (
                                            <span className="ml-2">
                                                • {assignments.length} projet{assignments.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {user.role === 'seller' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExpandUser(user.id)}
                                    >
                                        {isExpanded ? 'Masquer' : 'Projets'}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleRole(user.id, user.role)}
                                    disabled={isPending}
                                >
                                    {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user.id, user.email)}
                                    disabled={isPending}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Expanded: Project Assignments */}
                        {isExpanded && user.role === 'seller' && (
                            <div className="mt-4 pl-13 space-y-3">
                                <div className="text-sm font-medium">Projets assignés :</div>

                                {assignedProjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {assignedProjects.map(project => (
                                            <span
                                                key={project.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                            >
                                                {project.name}
                                                <button
                                                    onClick={() => handleRemoveAssignment(user.id, project.id)}
                                                    className="hover:text-destructive ml-1"
                                                    disabled={isPending}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun projet assigné</p>
                                )}

                                {availableProjects.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={(value) => handleAssignProject(user.id, value)}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Ajouter un projet..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProjects.map(project => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
