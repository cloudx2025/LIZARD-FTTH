/*
  # Trigger para Criação Automática de Perfil de Usuário

  1. Função
    - Cria automaticamente um perfil em user_profiles quando um usuário se registra
    - O primeiro usuário registrado será automaticamente admin
    - Usuários subsequentes serão 'user' por padrão

  2. Trigger
    - Dispara após INSERT em auth.users
    - Executa a função de criação de perfil automaticamente
*/

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários já existem
  SELECT COUNT(*) INTO user_count FROM user_profiles;

  -- Inserir o perfil do usuário
  INSERT INTO user_profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Criar perfis para usuários existentes que ainda não têm perfil
DO $$
DECLARE
  user_record RECORD;
  profile_count INTEGER;
  first_user BOOLEAN := true;
BEGIN
  FOR user_record IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM user_profiles)
  LOOP
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    
    INSERT INTO user_profiles (id, email, full_name, role, is_active)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', ''),
      CASE WHEN profile_count = 0 THEN 'admin' ELSE 'user' END,
      true
    );
  END LOOP;
END $$;
