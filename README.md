# Adigart Stock 📦

Application de gestion de stock et de ventes pour événements et pop-up stores.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

## ✨ Fonctionnalités

### 📊 Gestion de Stock
- Création de projets (événements/pop-up stores)
- Ajout de produits avec variantes (taille, couleur)
- Suivi des quantités en temps réel

### 🛒 Ventes & Panier
- Panier multi-produits
- Paiement espèces ou carte
- Ventes individuelles ou groupées
- Commentaires sur les transactions

### 🎁 Dons
- Suivi des dons (articles offerts)
- Calcul de la valeur estimée des dons

### 📈 Statistiques
- Chiffre d'affaires global
- Répartition Espèces/Carte
- Panier moyen
- Total par jour
- Stats par produit/variante

### 🔍 Historique
- Recherche par produit, date, commentaire
- Export CSV
- Modification/suppression (admin)

### 👥 Multi-utilisateurs
- Rôles : Admin / Vendeur
- Assignation par projet

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- Compte Supabase

### 1. Cloner le repo
```bash
git clone https://github.com/fwBoa/adigart_stock.git
cd adigart_stock
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configurer la base de données

un schema.sql est à realiser

### 5. Lancer en développement
```bash
npm run dev
```

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **TypeScript** | Typage statique |
| **Supabase** | Base de données PostgreSQL + Auth |
| **Tailwind CSS** | Styling |
| **Radix UI** | Composants accessibles |
| **Vercel** | Déploiement |

---

## 📁 Structure du Projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── projects/[id]/      # Page projet + historique
│   ├── categories/         # Gestion catégories
│   ├── users/              # Gestion utilisateurs
│   └── dashboard/          # Tableau de bord
├── components/             # Composants React
│   ├── ui/                 # Composants UI (shadcn)
│   ├── cart-drawer.tsx     # Panier
│   └── ...
├── lib/                    # Utilitaires
│   ├── supabase/           # Client Supabase
│   └── cart-context.tsx    # Context panier
└── middleware.ts           # Auth middleware
```

---

## 🔐 Sécurité

- Row Level Security (RLS) sur toutes les tables
- Authentification via Supabase Auth
- Rôles admin/vendeur avec permissions différenciées

---

## 📝 License

MIT

---


