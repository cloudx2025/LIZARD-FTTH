/*
  # Adicionar Configurações de Cor de Cabos e Modo Satélite

  1. Novas Configurações
    - `cable_color` - Cor padrão para cabos/rotas de fibra óptica
    - `map_layer` - Camada padrão do mapa (street ou satellite)

  2. Descrição
    - Permite aos usuários personalizar a cor padrão das rotas de fibra
    - Permite aos usuários escolher entre visualização padrão e satélite
    - Configurações aplicam-se globalmente no sistema
*/

-- Inserir novas configurações
INSERT INTO system_settings (key, value, description) VALUES
  ('cable_color', '"#3B82F6"', 'Cor padrão dos cabos/rotas de fibra óptica (azul)'),
  ('map_layer', '"street"', 'Camada padrão do mapa (street ou satellite)')
ON CONFLICT (key) DO NOTHING;
