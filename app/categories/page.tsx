import { createClient } from '@/lib/supabase/server'
import { AddCategoryDialog } from '@/components/add-category-dialog'
import { CategoryList } from '@/components/category-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="text-destructive">Erreur: {error.message}</div>
            </div>
        )
    }

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catégories</h1>
                        <p className="text-muted-foreground mt-1">Gérez vos catégories de produits</p>
                    </div>
                    <AddCategoryDialog />
                </div>
            </div>

            <div className="rounded-lg border bg-card">
                {!categories || categories.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Aucune catégorie. Créez-en une pour organiser vos produits.
                    </div>
                ) : (
                    <CategoryList categories={categories} />
                )}
            </div>
        </main>
    )
}
