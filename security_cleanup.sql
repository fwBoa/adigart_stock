-- NETTOYAGE : Supprimer les anciennes politiques {public} en double
-- Exécuter dans Supabase SQL Editor

-- ============================================
-- SUPPRIMER LES POLITIQUES PUBLIQUES REDONDANTES
-- ============================================

-- Categories
DROP POLICY IF EXISTS "Users can delete categories" ON categories;

-- Product Variants
DROP POLICY IF EXISTS "Users can delete variants" ON product_variants;
DROP POLICY IF EXISTS "Users can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Users can read variants" ON product_variants;
DROP POLICY IF EXISTS "Users can update variants" ON product_variants;

-- Products
DROP POLICY IF EXISTS "Users can delete products" ON products;

-- Projects
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

-- Transactions
DROP POLICY IF EXISTS "Users can delete transactions" ON transactions;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT 
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
