import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tag, Shield } from 'lucide-react'

async function getUserRole(userId: string): Promise<'admin' | 'seller' | null> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('getUserRole error:', error)
            return null
        }

        return data?.role as 'admin' | 'seller' | null
    } catch (e) {
        console.error('getUserRole exception:', e)
        return null
    }
}

export async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user role if logged in
    let isAdmin = false
    if (user) {
        const role = await getUserRole(user.id)
        isAdmin = role === 'admin'
        // Debug log
        console.log('[Header] User:', user.email, 'Role:', role, 'isAdmin:', isAdmin)
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center px-4">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <img
                        src="/assets/FAV-ICON-2.png"
                        alt="Adigart Stock"
                        className="h-8 w-8"
                    />
                    <span className="font-semibold text-lg hidden sm:inline-block">
                        Adigart Stock
                    </span>
                </Link>

                {/* Navigation Desktop */}
                {user && (
                    <nav className="ml-6 hidden sm:flex items-center gap-4">
                        <Link
                            href="/categories"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Catégories
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/users"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <Shield className="h-3 w-3" />
                                Utilisateurs
                            </Link>
                        )}
                    </nav>
                )}

                {/* Navigation Mobile */}
                {user && (
                    <div className="ml-4 sm:hidden flex items-center gap-3">
                        <Link
                            href="/categories"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Tag className="h-4 w-4" />
                            <span>Catégories</span>
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/users"
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Users</span>
                            </Link>
                        )}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Theme Toggle + User menu */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                {user.email}
                            </span>
                            <LogoutButton />
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
