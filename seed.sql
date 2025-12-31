-- Insert Dummy Projects
insert into projects (name, start_date)
values 
('Festival Été 2025', now()),
('Soirée Bénéfice', now() + interval '1 month');

-- Insert Dummy Categories
insert into categories (name)
values 
('Boissons'),
('Snacks'),
('Merch');

-- Insert Dummy Products (assuming UUIDs are auto-generated, we use subqueries to link them)
-- We need to do this in a way that captures the IDs if we were in a script, 
-- but for a simple SQL editor block, we can just insert and rely on names if we knew them, 
-- or just insert standalone for now if constraints allow nulls (which they don't for checking).
-- Let's just insert products linked to the first category/project found.

with 
  cat_drink as (select id from categories where name = 'Boissons' limit 1),
  cat_snack as (select id from categories where name = 'Snacks' limit 1),
  proj as (select id from projects limit 1)
insert into products (name, sku, price, stock, category_id, project_id)
values
('Coca-Cola', 'BEV-001', 2.50, 50, (select id from cat_drink), (select id from proj)),
('Eau Minérale', 'BEV-002', 1.50, 100, (select id from cat_drink), (select id from proj)),
('Chips Nature', 'SNK-001', 2.00, 30, (select id from cat_snack), (select id from proj));
