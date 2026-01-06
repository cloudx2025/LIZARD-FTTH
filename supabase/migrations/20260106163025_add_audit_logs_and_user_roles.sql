/*
  # Sistema de Auditoria e Roles de Usuários

  1. Nova Tabela: audit_logs
    - `id` (uuid, primary key) - Identificador único do log
    - `user_id` (uuid) - ID do usuário que realizou a ação
    - `user_email` (text) - Email do usuário para facilitar visualização
    - `action` (text) - Tipo de ação (INSERT, UPDATE, DELETE)
    - `table_name` (text) - Nome da tabela afetada
    - `record_id` (text) - ID do registro afetado
    - `record_name` (text) - Nome/descrição do registro para fácil identificação
    - `old_data` (jsonb) - Dados antes da alteração (para UPDATE e DELETE)
    - `new_data` (jsonb) - Dados após a alteração (para INSERT e UPDATE)
    - `created_at` (timestamptz) - Data/hora da ação

  2. Nova Tabela: user_profiles
    - `id` (uuid, primary key) - Mesmo ID do auth.users
    - `email` (text) - Email do usuário
    - `full_name` (text) - Nome completo
    - `role` (text) - Papel: 'admin' ou 'user'
    - `is_active` (boolean) - Se o usuário está ativo
    - `created_at` (timestamptz) - Data de criação
    - `updated_at` (timestamptz) - Última atualização

  3. Segurança
    - RLS habilitado em ambas as tabelas
    - Apenas admins podem ver e gerenciar user_profiles
    - Apenas admins podem ver audit_logs
    - Todos os usuários autenticados podem ver seu próprio perfil
*/

-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver próprio perfil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar perfis"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Novos usuários podem inserir próprio perfil"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id text NOT NULL,
  record_name text DEFAULT '',
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_logs
CREATE POLICY "Admins podem ver todos os logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
