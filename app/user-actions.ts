'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Type definitions
export type UserProfile = {
    id: string
    email: string
    role: 'admin' | 'seller'
    created_at: string
}

export type ProjectAssignment = {
    id: string
    user_id: string
    project_id: string
    created_at: string
}

// --- Get Current User Role ---
export async function getCurrentUserRole(): Promise<'admin' | 'seller' | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role || null
}

// --- Check if current user is admin ---
export async function isAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'admin'
}

// --- Get All Users ---
export async function getUsers(): Promise<UserProfile[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Users error:', error)
        return []
    }

    return data || []
}

// --- Get User's Project Assignments ---
export async function getUserAssignments(userId: string): Promise<string[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('project_assignments')
        .select('project_id')
        .eq('user_id', userId)

    return data?.map(a => a.project_id) || []
}

// --- Check if user can access project ---
export async function canAccessProject(projectId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Get user role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Admin can access all projects
    if (profile?.role === 'admin') return true

    // Seller can only access assigned projects
    const { data: assignment } = await supabase
        .from('project_assignments')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single()

    return !!assignment
}

// --- Create Seller Account (Admin Only) ---
export async function createSellerAccount(email: string, password: string) {
    const supabase = await createClient()

    // Check if current user is admin
    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    try {
        // Create user via Supabase Auth signUp
        // Note: This will create a user without email verification for simplicity
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Don't send confirmation email - admin creates the account
                emailRedirectTo: undefined
            }
        })

        if (authError) {
            console.error('Auth signUp error:', authError)
            if (authError.message.includes('already registered')) {
                return { message: 'Cet email est déjà enregistré' }
            }
            return { message: `Erreur: ${authError.message}` }
        }

        if (!authData.user) {
            return { message: 'Erreur lors de la création du compte' }
        }

        // Create profile for the new user
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                email: email,
                role: 'seller'
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // User was created in auth but profile failed - still partial success
            return { message: 'Compte créé mais profil non configuré. Vérifiez manuellement.' }
        }

        revalidatePath('/users')
        return { message: `Vendeur "${email}" créé avec succès` }
    } catch (error) {
        console.error('Create Seller error:', error)
        return { message: 'Erreur lors de la création du compte' }
    }
}

// --- Assign User to Project (Admin Only) ---
export async function assignUserToProject(userId: string, projectId: string) {
    const supabase = await createClient()

    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    try {
        const { error } = await supabase
            .from('project_assignments')
            .insert({ user_id: userId, project_id: projectId })

        if (error) {
            if (error.code === '23505') {
                return { message: 'Utilisateur déjà assigné à ce projet' }
            }
            throw error
        }
    } catch (error) {
        console.error('Assign User error:', error)
        return { message: 'Erreur lors de l\'assignation' }
    }

    revalidatePath('/users')
    return { message: 'Utilisateur assigné au projet' }
}

// --- Remove User from Project (Admin Only) ---
export async function removeUserFromProject(userId: string, projectId: string) {
    const supabase = await createClient()

    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    try {
        const { error } = await supabase
            .from('project_assignments')
            .delete()
            .eq('user_id', userId)
            .eq('project_id', projectId)

        if (error) throw error
    } catch (error) {
        console.error('Remove Assignment error:', error)
        return { message: 'Erreur lors de la suppression' }
    }

    revalidatePath('/users')
    return { message: 'Assignation supprimée' }
}

// --- Update User Role (Admin Only) ---
export async function updateUserRole(userId: string, newRole: 'admin' | 'seller') {
    const supabase = await createClient()

    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) throw error
    } catch (error) {
        console.error('Update Role error:', error)
        return { message: 'Erreur lors de la mise à jour' }
    }

    revalidatePath('/users')
    return { message: `Rôle mis à jour: ${newRole}` }
}

// --- Delete User (Admin Only) ---
export async function deleteUser(userId: string) {
    const supabase = await createClient()

    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    // Prevent self-deletion
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) {
        return { message: 'Vous ne pouvez pas supprimer votre propre compte' }
    }

    try {
        // Delete profile (cascade will remove assignments)
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', userId)

        if (error) throw error
    } catch (error) {
        console.error('Delete User error:', error)
        return { message: 'Erreur lors de la suppression' }
    }

    revalidatePath('/users')
    return { message: 'Utilisateur supprimé' }
}
