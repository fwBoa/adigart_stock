'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TransactionSchema = z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    type: z.enum(['SALE', 'GIFT']),
    paymentMethod: z.enum(['CASH', 'CARD']).optional(),
    quantity: z.number().int().positive(),
    amount: z.number().nonnegative(),
})

const CreateProductSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    sku: z.string().optional(),
    price: z.number().min(0, "Le prix doit être positif"),
    stock: z.number().int().min(0, "Le stock doit être positif"),
    categoryId: z.string().uuid().optional(),
    projectId: z.string().uuid(),
})

export type TransactionState = {
    message: string
    errors?: {
        productId?: string[]
        variantId?: string[]
        type?: string[]
        paymentMethod?: string[]
        quantity?: string[]
        amount?: string[]
    }
}

export async function processTransaction(prevState: TransactionState, formData: FormData) {
    const validatedFields = TransactionSchema.safeParse({
        productId: formData.get('productId'),
        variantId: formData.get('variantId') || undefined,
        type: formData.get('type'),
        paymentMethod: formData.get('paymentMethod') || undefined,
        quantity: Number(formData.get('quantity')),
        amount: Number(formData.get('amount')),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { productId, variantId, type, paymentMethod, quantity, amount } = validatedFields.data

    const supabase = await createClient()

    // Use atomic PostgreSQL function to prevent race conditions
    const { data, error } = await supabase.rpc('process_transaction', {
        p_product_id: productId,
        p_variant_id: variantId || null,
        p_type: type,
        p_payment_method: type === 'SALE' ? (paymentMethod || 'CASH') : null,
        p_quantity: quantity,
        p_amount: amount,
    })

    if (error) {
        console.error('Transaction error:', error)
        return { message: 'Erreur lors de la transaction.' }
    }

    if (!data.success) {
        return { message: data.error || 'Erreur inconnue' }
    }

    revalidatePath('/projects')
    return { message: 'Transaction successful' }
}

export type CreateProductState = {
    message?: string
    errors?: {
        name?: string[]
        sku?: string[]
        price?: string[]
        stock?: string[]
        categoryId?: string[]
    }
}

export async function createProduct(prevState: CreateProductState, formData: FormData) {
    const validatedFields = CreateProductSchema.safeParse({
        name: formData.get('name'),
        sku: formData.get('sku'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        categoryId: formData.get('categoryId') || undefined,
        projectId: formData.get('projectId'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { name, sku, price, stock, categoryId, projectId } = validatedFields.data
    const supabase = await createClient()

    // Handle image upload if provided
    let imageUrl: string | null = null
    const imageFile = formData.get('image') as File | null
    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 Mo

    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > MAX_FILE_SIZE) {
            return { message: 'L\'image est trop volumineuse (max 2 Mo)' }
        }

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, imageFile)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { message: 'Erreur lors de l\'upload de l\'image' }
        }

        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
    }

    try {
        const { error } = await supabase
            .from('products')
            .insert({
                name,
                sku,
                price,
                stock,
                category_id: categoryId,
                project_id: projectId,
                image_url: imageUrl,
            })

        if (error) throw error
    } catch (error) {
        console.error('Create Product error:', error)
        return {
            message: 'Database error: Failed to create product.',
        }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Produit créé avec succès' }
}

// --- Project Actions ---
const CreateProjectSchema = z.object({
    name: z.string().min(1, "Le nom du projet est requis"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

export type CreateProjectState = {
    message?: string
    errors?: {
        name?: string[]
        startDate?: string[]
        endDate?: string[]
    }
}

export async function createProject(prevState: CreateProjectState, formData: FormData) {
    const validatedFields = CreateProjectSchema.safeParse({
        name: formData.get('name'),
        startDate: formData.get('startDate') || undefined,
        endDate: formData.get('endDate') || undefined,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { name, startDate, endDate } = validatedFields.data
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('projects')
            .insert({
                name,
                start_date: startDate ? new Date(startDate).toISOString() : null,
                end_date: endDate ? new Date(endDate).toISOString() : null,
            })

        if (error) throw error
    } catch (error) {
        console.error('Create Project error:', error)
        return {
            message: 'Database error: Failed to create project.',
        }
    }

    revalidatePath('/')
    return { message: 'Projet créé avec succès' }
}

// --- Category Actions ---
const CreateCategorySchema = z.object({
    name: z.string().min(1, "Le nom de la catégorie est requis"),
})

export type CategoryState = {
    message?: string
    errors?: {
        name?: string[]
    }
}

export async function createCategory(prevState: CategoryState, formData: FormData) {
    const validatedFields = CreateCategorySchema.safeParse({
        name: formData.get('name'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { name } = validatedFields.data
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('categories')
            .insert({ name })

        if (error) throw error
    } catch (error) {
        console.error('Create Category error:', error)
        return {
            message: 'Database error: Failed to create category.',
        }
    }

    revalidatePath('/')
    return { message: 'Catégorie créée avec succès' }
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId)

        if (error) throw error
    } catch (error) {
        console.error('Delete Category error:', error)
        return { message: 'Erreur lors de la suppression' }
    }

    revalidatePath('/')
    return { message: 'Catégorie supprimée' }
}

// --- Restock Action ---
const RestockSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
})

export type RestockState = {
    message?: string
    errors?: {
        productId?: string[]
        quantity?: string[]
    }
}

export async function restockProduct(prevState: RestockState, formData: FormData) {
    const validatedFields = RestockSchema.safeParse({
        productId: formData.get('productId'),
        quantity: Number(formData.get('quantity')),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { productId, quantity } = validatedFields.data
    const supabase = await createClient()

    try {
        // Fetch current stock
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, project_id')
            .eq('id', productId)
            .single()

        if (fetchError || !product) throw fetchError || new Error('Product not found')

        // Update stock
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock: product.stock + quantity })
            .eq('id', productId)

        if (updateError) throw updateError

        revalidatePath(`/projects/${product.project_id}`)
    } catch (error) {
        console.error('Restock error:', error)
        return {
            message: 'Database error: Failed to restock product.',
        }
    }

    return { message: 'Stock mis à jour' }
}

// --- Delete Product ---
export async function deleteProduct(productId: string, projectId: string) {
    const supabase = await createClient()

    try {
        // First delete related transactions
        await supabase
            .from('transactions')
            .delete()
            .eq('product_id', productId)

        // Then delete the product
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        if (error) throw error
    } catch (error) {
        console.error('Delete Product error:', error)
        return { message: 'Erreur lors de la suppression' }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Produit supprimé' }
}

// --- Archive/Unarchive Project ---
export async function toggleProjectArchive(projectId: string, archived: boolean) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('projects')
            .update({ archived })
            .eq('id', projectId)

        if (error) throw error
    } catch (error) {
        console.error('Archive Project error:', error)
        return { message: 'Erreur lors de l\'archivage' }
    }

    revalidatePath('/')
    return { message: archived ? 'Projet archivé' : 'Projet désarchivé' }
}

// --- Delete Project ---
export async function deleteProject(projectId: string) {
    const supabase = await createClient()

    // Check user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Non autorisé' }
    }

    try {
        // Get all products for this project
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id')
            .eq('project_id', projectId)

        if (productsError) {
            console.error('Error fetching products:', productsError)
        }

        // Delete all related transactions first
        if (products && products.length > 0) {
            const productIds = products.map(p => p.id)
            const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .in('product_id', productIds)

            if (txError) {
                console.error('Error deleting transactions:', txError)
            }
        }

        // Delete all products
        const { error: delProductsError } = await supabase
            .from('products')
            .delete()
            .eq('project_id', projectId)

        if (delProductsError) {
            console.error('Error deleting products:', delProductsError)
        }

        // Delete the project
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId)

        if (error) {
            console.error('Error deleting project:', error)
            throw error
        }
    } catch (error) {
        console.error('Delete Project error:', error)
        return { message: 'Erreur lors de la suppression du projet' }
    }

    revalidatePath('/')
    return { message: 'Projet supprimé' }
}

// --- Update Product ---
const UpdateProductSchema = z.object({
    productId: z.string().uuid(),
    projectId: z.string().uuid(),
    name: z.string().min(1, "Le nom est requis"),
    sku: z.string().optional(),
    price: z.number().min(0, "Le prix doit être positif"),
    stock: z.number().int().min(0, "Le stock doit être positif"),
    categoryId: z.string().uuid().optional().nullable(),
})

export type UpdateProductState = {
    message?: string
    errors?: {
        name?: string[]
        price?: string[]
        stock?: string[]
    }
}

export async function updateProduct(prevState: UpdateProductState, formData: FormData) {
    const validatedFields = UpdateProductSchema.safeParse({
        productId: formData.get('productId'),
        projectId: formData.get('projectId'),
        name: formData.get('name'),
        sku: formData.get('sku') || undefined,
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        categoryId: formData.get('categoryId') || null,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    const { productId, projectId, name, sku, price, stock, categoryId } = validatedFields.data
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('products')
            .update({
                name,
                sku,
                price,
                stock,
                category_id: categoryId,
            })
            .eq('id', productId)

        if (error) throw error
    } catch (error) {
        console.error('Update Product error:', error)
        return { message: 'Erreur lors de la mise à jour' }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Produit mis à jour' }
}

// --- Variant Actions ---

export async function createVariant(
    productId: string,
    projectId: string,
    data: { size?: string; color?: string; stock: number; sku?: string }
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Non autorisé' }
    }

    try {
        const { error } = await supabase
            .from('product_variants')
            .insert({
                product_id: productId,
                size: data.size || null,
                color: data.color || null,
                stock: data.stock,
                sku: data.sku || null,
            })

        if (error) throw error
    } catch (error) {
        console.error('Create Variant error:', error)
        return { message: 'Erreur lors de la création de la variante' }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Variante créée' }
}

export async function deleteVariant(variantId: string, projectId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Non autorisé' }
    }

    try {
        const { error } = await supabase
            .from('product_variants')
            .delete()
            .eq('id', variantId)

        if (error) throw error
    } catch (error) {
        console.error('Delete Variant error:', error)
        return { message: 'Erreur lors de la suppression' }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Variante supprimée' }
}

export async function restockVariant(variantId: string, projectId: string, quantity: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'Non autorisé' }
    }

    try {
        const { data: variant, error: fetchError } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', variantId)
            .single()

        if (fetchError) throw fetchError

        const { error } = await supabase
            .from('product_variants')
            .update({ stock: variant.stock + quantity })
            .eq('id', variantId)

        if (error) throw error
    } catch (error) {
        console.error('Restock Variant error:', error)
        return { message: 'Erreur lors du réappro' }
    }

    revalidatePath(`/projects/${projectId}`)
    return { message: 'Stock mis à jour' }
}
