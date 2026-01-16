-- MIGRATION: Panier, Commentaires et Modification des Transactions
-- Exécuter dans Supabase SQL Editor
-- 1. Ajouter le commentaire aux transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS comment TEXT;
-- 2. Ajouter un group_id pour les paniers (transactions groupées)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS sale_group_id UUID;
-- 3. Policy UPDATE pour les transactions (admin seulement)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'transactions'
        AND policyname = 'Admin can update transactions'
) THEN CREATE POLICY "Admin can update transactions" ON transactions FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
END IF;
END $$;
-- 4. Policy DELETE pour les transactions (admin seulement)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'transactions'
        AND policyname = 'Admin can delete transactions'
) THEN CREATE POLICY "Admin can delete transactions" ON transactions FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
END IF;
END $$;
-- 5. Fonction pour mettre à jour une transaction avec recalcul du stock
CREATE OR REPLACE FUNCTION update_transaction_with_stock(
        p_transaction_id UUID,
        p_new_quantity INTEGER,
        p_new_amount NUMERIC,
        p_new_payment_method payment_method,
        p_new_type transaction_type,
        p_new_comment TEXT
    ) RETURNS JSON AS $$
DECLARE v_old_quantity INTEGER;
v_product_id UUID;
v_variant_id UUID;
v_stock_diff INTEGER;
BEGIN -- Get current transaction data
SELECT quantity,
    product_id,
    variant_id INTO v_old_quantity,
    v_product_id,
    v_variant_id
FROM transactions
WHERE id = p_transaction_id;
IF NOT FOUND THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Transaction non trouvée'
);
END IF;
-- Calculate stock difference (positive = need to decrement more, negative = need to restore)
v_stock_diff := p_new_quantity - v_old_quantity;
-- Check if we have enough stock for an increase
IF v_stock_diff > 0 THEN IF v_variant_id IS NOT NULL THEN IF (
    SELECT stock
    FROM product_variants
    WHERE id = v_variant_id
) < v_stock_diff THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Stock insuffisant pour cette modification'
);
END IF;
ELSE IF (
    SELECT stock
    FROM products
    WHERE id = v_product_id
) < v_stock_diff THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Stock insuffisant pour cette modification'
);
END IF;
END IF;
END IF;
-- Update stocks
IF v_variant_id IS NOT NULL THEN
UPDATE product_variants
SET stock = stock - v_stock_diff
WHERE id = v_variant_id;
UPDATE products
SET stock = stock - v_stock_diff
WHERE id = v_product_id;
ELSE
UPDATE products
SET stock = stock - v_stock_diff
WHERE id = v_product_id;
END IF;
-- Update transaction
UPDATE transactions
SET quantity = p_new_quantity,
    amount = p_new_amount,
    payment_method = p_new_payment_method,
    type = p_new_type,
    comment = p_new_comment
WHERE id = p_transaction_id;
RETURN json_build_object('success', true);
EXCEPTION
WHEN OTHERS THEN RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 6. Fonction pour supprimer une transaction et restaurer le stock
CREATE OR REPLACE FUNCTION delete_transaction_with_stock(p_transaction_id UUID) RETURNS JSON AS $$
DECLARE v_quantity INTEGER;
v_product_id UUID;
v_variant_id UUID;
BEGIN -- Get transaction data
SELECT quantity,
    product_id,
    variant_id INTO v_quantity,
    v_product_id,
    v_variant_id
FROM transactions
WHERE id = p_transaction_id;
IF NOT FOUND THEN RETURN json_build_object(
    'success',
    false,
    'error',
    'Transaction non trouvée'
);
END IF;
-- Restore stocks
IF v_variant_id IS NOT NULL THEN
UPDATE product_variants
SET stock = stock + v_quantity
WHERE id = v_variant_id;
UPDATE products
SET stock = stock + v_quantity
WHERE id = v_product_id;
ELSE
UPDATE products
SET stock = stock + v_quantity
WHERE id = v_product_id;
END IF;
-- Delete transaction
DELETE FROM transactions
WHERE id = p_transaction_id;
RETURN json_build_object('success', true);
EXCEPTION
WHEN OTHERS THEN RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;