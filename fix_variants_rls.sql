-- Enable RLS on product_variants if not already enabled
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for authenticated users on product_variants
DROP POLICY IF EXISTS "Allow all on product_variants" ON product_variants;
CREATE POLICY "Allow all on product_variants" ON product_variants
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Also allow public access if you are not using auth strictly yet (like other tables)
-- Based on schema.sql, other tables have "Allow public..."
DROP POLICY IF EXISTS "Allow public read access on product_variants" ON product_variants;
CREATE POLICY "Allow public read access on product_variants" ON product_variants
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access on product_variants" ON product_variants;
CREATE POLICY "Allow public insert access on product_variants" ON product_variants
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on product_variants" ON product_variants;
CREATE POLICY "Allow public update access on product_variants" ON product_variants
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access on product_variants" ON product_variants;
CREATE POLICY "Allow public delete access on product_variants" ON product_variants
FOR DELETE USING (true);
