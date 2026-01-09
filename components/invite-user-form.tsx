'use client'

import { useState, useTransition } from 'react'
import { createSellerAccount } from '@/app/user-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'

export function InviteUserForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)

    // Generate a random password
    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
        let result = ''
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(result)
        setShowPassword(true)
    }

    const copyCredentials = () => {
        const text = `Email: ${email}\nMot de passe: ${password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return

        startTransition(async () => {
            const result = await createSellerAccount(email, password)
            if (result.message.includes('créé')) {
                setMessage({ type: 'success', text: result.message })
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        })
    }

    return (
        <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Ajouter un vendeur</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="vendeur@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="password" className="text-xs text-muted-foreground">Mot de passe</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                                Générer
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isPending || !email || !password}>
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Créer le compte
                    </Button>

                    {password && email && (
                        <Button type="button" variant="outline" size="sm" onClick={copyCredentials}>
                            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                            {copied ? 'Copié !' : 'Copier identifiants'}
                        </Button>
                    )}
                </div>

                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
            </form>
        </div>
    )
}
