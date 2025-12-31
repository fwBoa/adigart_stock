'use client'

import { useActionState } from 'react'
import { login, LoginState } from '@/app/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'

const initialState: LoginState = {
    message: '',
    errors: {}
}

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto">
                        <img
                            src="/assets/FAV-ICON-2.png"
                            alt="Adigart Stock"
                            className="h-16 w-16 mx-auto"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Adigart Stock</CardTitle>
                        <CardDescription>
                            Connectez-vous pour gérer votre inventaire
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                                className="transition-all"
                            />
                            {state.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="transition-all"
                            />
                            {state.errors?.password && (
                                <p className="text-sm text-red-500">{state.errors.password}</p>
                            )}
                        </div>

                        {state.message && !state.errors && (
                            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                                {state.message}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Se connecter
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
