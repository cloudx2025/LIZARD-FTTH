/*
  # Configurações do Sistema e Segurança Avançada

  1. Nova Tabela: system_settings
    - `id` (uuid, primary key) - Identificador único
    - `key` (text, unique) - Chave da configuração
    - `value` (jsonb) - Valor da configuração
    - `description` (text) - Descrição da configuração
    - `updated_at` (timestamptz) - Data da última atualização
    - `updated_by` (uuid) - Usuário que atualizou

  2. Nova Tabela: login_history
    - `id` (uuid, primary key) - Identificador único
    - `user_id` (uuid) - ID do usuário
    - `email` (text) - Email do usuário
    - `success` (boolean) - Se o login foi bem-sucedido
    - `ip_address` (text) - Endereço IP
    - `user_agent` (text) - User agent do navegador
    - `created_at` (timestamptz) - Data/hora do login

  3. Atualização: user_profiles
    - Adicionar campos: last_login, login_attempts, locked_until

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Apenas admins podem gerenciar configurações
    - Apenas admins podem ver histórico de login
*/

-- Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para system_settings
CREATE POLICY "Admins podem ver configurações"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar configurações"
  ON system_settings FOR UPDATE
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

CREATE POLICY "Admins podem inserir configurações"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Criar tabela de histórico de login
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  success boolean DEFAULT true,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Políticas para login_history
CREATE POLICY "Admins podem ver histórico de login"
  ON login_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir histórico de login"
  ON login_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Adicionar campos de segurança em user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'login_attempts'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN login_attempts integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'locked_until'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN locked_until timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description) VALUES
  ('pop_color', '"#10B981"', 'Cor padrão dos ícones POP (verde)'),
  ('cto_color', '"#F59E0B"', 'Cor padrão dos ícones CTO (laranja)')
ON CONFLICT (key) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Trigger para atualizar updated_at em system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
