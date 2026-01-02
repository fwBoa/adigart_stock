import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch project
    const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('id', id)
        .single()

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch transactions with product info
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
      *,
      products!inner (
        name,
        sku,
        project_id
      ),
      product_variants (
        size,
        color,
        sku
      )
    `)
        .eq('products.project_id', id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Helper to format variant
    const formatVariant = (v: any) => {
        if (!v) return ''
        const parts = []
        if (v.size) parts.push(v.size)
        if (v.color) parts.push(v.color)
        return parts.join(' / ')
    }

    // Generate CSV
    const headers = ['Date', 'Produit', 'Variante', 'SKU', 'Type', 'Quantité', 'Montant (€)']
    const rows = transactions?.map(t => [
        new Date(t.created_at).toLocaleString('fr-FR'),
        t.products?.name || '',
        formatVariant(t.product_variants),
        t.product_variants?.sku || t.products?.sku || '',
        t.type === 'SALE' ? 'Vente' : 'Don',
        t.quantity.toString(),
        Number(t.amount).toFixed(2)
    ]) || []

    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n')

    // Add BOM for Excel compatibility with special characters
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    const filename = `export-${project.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csvWithBom, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    })
}
