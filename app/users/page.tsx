import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin, getUsers } from '@/app/user-actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, User, Crown } from 'lucide-react'
import { UserList } from '@/components/user-list'
import { InviteUserForm } from '@/components/invite-user-form'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
        redirect('/')
    }

    // Get all users
    const users = await getUsers()

    // Get all projects for assignment dropdown
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('archived', false)
        .order('name')

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </Link>

                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Gestion des Utilisateurs
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Gérez les vendeurs et leurs accès aux projets.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Admins</p>
                    </div>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Vendeurs</p>
                    </div>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'seller').length}</p>
                </div>
            </div>

            {/* User List with Invite Form */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <InviteUserForm />
                <UserList users={users} projects={projects || []} />
            </div>
        </main>
    )
}
