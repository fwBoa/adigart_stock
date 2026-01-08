-- MIGRATION: Système de Rôles Admin/Vendeur
-- Exécuter dans Supabase SQL Editor

-- 1. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table d'assignation vendeurs <-> projets
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 3. Activer RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Politique: Tout utilisateur authentifié peut lire les profils
CREATE POLICY "Users can view profiles" ON user_profiles
  FOR SELECT TO authenticated USING (true);

-- 5. Politique: Seul admin peut modifier les profils
CREATE POLICY "Admin can manage profiles" ON user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Politique: Lecture des assignations
CREATE POLICY "Users can view assignments" ON project_assignments
  FOR SELECT TO authenticated USING (true);

-- 7. Politique: Admin peut gérer les assignations
CREATE POLICY "Admin can manage assignments" ON project_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Créer le profil admin pour l'utilisateur actuel
-- IMPORTANT: Remplacez 'VOTRE_EMAIL' par votre email
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users 
WHERE email = 'VOTRE_EMAIL'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Pour voir l'ID de l'utilisateur courant:
-- SELECT * FROM auth.users;
