-- MIGRATION COMPLETE POUR LA GESTION DES VARIANTES DANS LES TRANSACTIONS
-- Version corrigée avec DROP FUNCTION

-- 1. Ajouter la colonne variant_id à la table transactions si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'variant_id') THEN 
        ALTER TABLE transactions ADD COLUMN variant_id UUID REFERENCES product_variants(id); 
    END IF; 
END $$;

-- 2. Supprimer les anciennes définitions de la fonction pour éviter les conflits de type
DROP FUNCTION IF EXISTS process_transaction(uuid, uuid, transaction_type, payment_method, integer, numeric);
-- Supprimer aussi l'ancienne signature sans variant_id si elle existe encore
DROP FUNCTION IF EXISTS process_transaction(uuid, transaction_type, payment_method, integer, numeric);

-- 3. Création de la fonction de transaction "Robuste"
CREATE OR REPLACE FUNCTION process_transaction(
  p_product_id UUID,
  p_variant_id UUID,
  p_type transaction_type,
  p_payment_method payment_method,
  p_quantity INTEGER,
  p_amount NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  -- Vérifications de stock
  IF p_variant_id IS NOT NULL THEN
    SELECT stock INTO v_current_stock FROM product_variants WHERE id = p_variant_id;
    IF v_current_stock < p_quantity THEN
         RETURN json_build_object('success', false, 'error', 'Stock insuffisant pour cette variante');
    END IF;
  ELSE
    SELECT stock INTO v_current_stock FROM products WHERE id = p_product_id;
    IF v_current_stock < p_quantity THEN
         RETURN json_build_object('success', false, 'error', 'Stock insuffisant pour ce produit');
    END IF;
  END IF;

  -- Enregistrer la transaction
  INSERT INTO transactions (product_id, variant_id, type, payment_method, quantity, amount)
  VALUES (p_product_id, p_variant_id, p_type, p_payment_method, p_quantity, p_amount);

  -- Mettre à jour les stocks (Synchro Parent/Variante)
  IF p_variant_id IS NOT NULL THEN
    -- 1. Décrémenter la variante
    UPDATE product_variants SET stock = stock - p_quantity WHERE id = p_variant_id;
    
    -- 2. Décrémenter AUSSI le produit parent (Single Source of Truth globale)
    UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
  ELSE
    -- Produit simple
    UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
  END IF;

  RETURN json_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
