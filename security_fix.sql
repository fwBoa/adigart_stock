-- MIGRATION SÉCURITÉ : Correction des politiques RLS
-- Exécuter dans Supabase SQL Editor

-- ============================================
-- 1. SUPPRIMER LES ANCIENNES POLITIQUES PERMISSIVES
-- ============================================

-- Products
DROP POLICY IF EXISTS "Allow public insert access on products" ON products;
DROP POLICY IF EXISTS "Allow public update access on products" ON products;
DROP POLICY IF EXISTS "Allow public delete access on products" ON products;

-- Product Variants
DROP POLICY IF EXISTS "Allow public insert access on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public update access on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public delete access on product_variants" ON product_variants;

-- Categories
DROP POLICY IF EXISTS "Allow public insert access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public update access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public delete access on categories" ON categories;

-- Projects
DROP POLICY IF EXISTS "Allow public insert access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public update access on projects" ON projects;
DROP POLICY IF EXISTS "Allow public delete access on projects" ON projects;

-- Transactions
DROP POLICY IF EXISTS "Allow public insert access on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow public delete access on transactions" ON transactions;

-- ============================================
-- 2. CRÉER DES POLITIQUES SÉCURISÉES (Authentifiés uniquement)
-- ============================================

-- PRODUCTS : Lecture publique, Modification authentifiée
CREATE POLICY "Authenticated users can insert products" ON products
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON products
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products" ON products
FOR DELETE TO authenticated USING (true);

-- PRODUCT_VARIANTS : Lecture publique, Modification authentifiée
CREATE POLICY "Authenticated users can insert variants" ON product_variants
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update variants" ON product_variants
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete variants" ON product_variants
FOR DELETE TO authenticated USING (true);

-- CATEGORIES : Lecture publique, Modification authentifiée
CREATE POLICY "Authenticated users can insert categories" ON categories
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON categories
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories" ON categories
FOR DELETE TO authenticated USING (true);

-- PROJECTS : Lecture publique, Modification authentifiée
CREATE POLICY "Authenticated users can insert projects" ON projects
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON projects
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects" ON projects
FOR DELETE TO authenticated USING (true);

-- TRANSACTIONS : Lecture publique, Modification authentifiée
CREATE POLICY "Authenticated users can insert transactions" ON transactions
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions" ON transactions
FOR DELETE TO authenticated USING (true);

-- ============================================
-- 3. CORRIGER LE SEARCH_PATH DE LA FONCTION
-- ============================================

-- Note: La fonction process_transaction doit être recréée avec search_path
-- Utilisez cette commande pour voir la définition actuelle:
-- SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'process_transaction';

-- Après avoir vu la définition, ajoutez à la fin:
-- SET search_path = public

-- ============================================
-- 4. VÉRIFICATION
-- ============================================

-- Vérifier les nouvelles politiques
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
