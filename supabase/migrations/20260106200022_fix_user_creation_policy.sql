/*
  # Corrigir Políticas de Criação de Usuários

  1. Mudanças
    - Adicionar política para admins criarem perfis de outros usuários
    - Remover trigger automático para ter controle total no processo

  2. Segurança
    - Apenas admins podem criar perfis de outros usuários
    - Mantém todas as outras políticas de segurança
*/

-- Remover o trigger automático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Adicionar política para admins inserirem perfis de novos usuários
DROP POLICY IF EXISTS "Admins podem inserir novos perfis" ON user_profiles;
CREATE POLICY "Admins podem inserir novos perfis"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
