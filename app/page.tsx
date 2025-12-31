import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { ProjectActions } from "@/components/project-actions"
import { CalendarDays, Package, ArrowRight, FolderOpen, Archive } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectList() {
  const supabase = await createClient()

  // Fetch projects with product count
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, products(count)')
    .order('archived', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-destructive">Erreur: {error.message}</div>
      </div>
    )
  }

  const activeProjects = projects?.filter(p => !p.archived) || []
  const archivedProjects = projects?.filter(p => p.archived) || []

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mes Événements</h1>
          <p className="text-muted-foreground mt-1">Sélectionnez un projet pour gérer son stock.</p>
        </div>
        <AddProjectDialog />
      </div>

      {/* Active Projects Grid */}
      {activeProjects.length === 0 && archivedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun projet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Créez votre premier événement pour commencer à gérer votre inventaire.
          </p>
          <AddProjectDialog />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => {
              const productCount = project.products?.[0]?.count || 0
              return (
                <Card key={project.id} className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Link href={`/projects/${project.id}`} className="flex-1 group">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                      </Link>
                      <ProjectActions projectId={project.id} projectName={project.name} isArchived={false} />
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <CalendarDays className="h-4 w-4" />
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(project.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/projects/${project.id}`} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{productCount} produit{productCount !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="text-xs text-muted-foreground/60 group-hover:text-primary/60 transition-colors flex items-center gap-1">
                        Voir <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Archived Projects */}
          {archivedProjects.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <Archive className="h-5 w-5" /> Projets archivés
              </h2>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {archivedProjects.map((project) => {
                  const productCount = project.products?.[0]?.count || 0
                  return (
                    <Card key={project.id} className="h-full opacity-60 hover:opacity-100 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Link href={`/projects/${project.id}`} className="flex-1 group">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {project.name}
                            </CardTitle>
                          </Link>
                          <ProjectActions projectId={project.id} projectName={project.name} isArchived={true} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{productCount} produit{productCount !== 1 ? 's' : ''}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
