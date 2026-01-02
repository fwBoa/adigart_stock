-- CORRECTION DES PERMISSIONS (RLS) UNIQUEMENT
-- Ne crée PAS de table, corrige juste les accès "invisibles"

-- 1. Activer la sécurité (normalement déjà fait)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 2. Nettoyer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Allow all on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public insert access on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public update access on product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow public delete access on product_variants" ON product_variants;

-- 3. AJOUTER LES POLITIQUES DE LECTURE/ECRITURE (IMPORTANT)

-- Lecture (SELECT) : Tout le monde peut voir les variantes (nécessaire pour l'UI)
CREATE POLICY "Allow public read access on product_variants" 
ON product_variants FOR SELECT 
USING (true);

-- Insertion (INSERT) : Tout le monde peut ajouter
CREATE POLICY "Allow public insert access on product_variants" 
ON product_variants FOR INSERT 
WITH CHECK (true);

-- Modification (UPDATE) : Tout le monde peut modifier (stock)
CREATE POLICY "Allow public update access on product_variants" 
ON product_variants FOR UPDATE 
USING (true);

-- Suppression (DELETE) : Tout le monde peut supprimer
CREATE POLICY "Allow public delete access on product_variants" 
ON product_variants FOR DELETE 
USING (true);
