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

// --- Invite User (Admin Only) ---
export async function inviteUser(email: string, role: 'admin' | 'seller' = 'seller') {
    const supabase = await createClient()

    // Check if current user is admin
    if (!await isAdmin()) {
        return { message: 'Non autorisé' }
    }

    try {
        // Use Supabase Admin API to invite user
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)

        if (error) {
            // If admin API not available, user needs to sign up manually
            // We'll create a placeholder profile
            console.error('Invite error:', error)
            return { message: 'Envoyez ce lien d\'inscription à l\'utilisateur: /signup' }
        }

        // Create profile for invited user
        if (data.user) {
            await supabase
                .from('user_profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    role: role
                })
        }

        return { message: `Invitation envoyée à ${email}` }
    } catch (error) {
        console.error('Invite User error:', error)
        return { message: 'Erreur lors de l\'invitation' }
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
