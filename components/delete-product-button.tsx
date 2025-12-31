'use client'

import { deleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

type DeleteProductButtonProps = {
    productId: string
    productName: string
    projectId: string
}

export function DeleteProductButton({ productId, productName, projectId }: DeleteProductButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (confirm(`Supprimer le produit "${productName}" et toutes ses transactions ?`)) {
            startTransition(async () => {
                await deleteProduct(productId, projectId)
            })
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
