'use client'

import { deleteCategory } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Trash2, Tag } from 'lucide-react'
import { useTransition } from 'react'

type Category = {
    id: string
    name: string
    created_at: string
}

export function CategoryList({ categories }: { categories: Category[] }) {
    return (
        <ul className="divide-y">
            {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
            ))}
        </ul>
    )
}

function CategoryItem({ category }: { category: Category }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm(`⚠️ Supprimer la catégorie "${category.name}" ?\n\nLes produits dans cette catégorie ne seront pas supprimés, mais n'auront plus de catégorie.`)) {
            startTransition(async () => {
                await deleteCategory(category.id)
            })
        }
    }

    return (
        <li className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{category.name}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </li>
    )
}
