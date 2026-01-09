# Sistema de Rede - Versão 5

## Visão Geral

Este é um sistema simplificado de documentação de rede de fibra óptica com mapa interativo. A Versão 5 foca nas funcionalidades essenciais sem recursos administrativos avançados.

---

## Funcionalidades Principais

### 1. Autenticação
- Login e registro de usuários
- Gerenciamento de sessão
- Logout seguro

### 2. Gerenciamento de POPs (Points of Presence)
- Cadastro, edição e exclusão de POPs
- Campos: nome, latitude, longitude, endereço, descrição
- Ícone: Datacenter (cor verde padrão)

### 3. Gerenciamento de Cabos
- Cadastro, edição e exclusão de cabos de fibra óptica
- Tipos: Fibra Óptica, Coaxial, Par Trançado
- Campos: nome, tipo, capacidade, comprimento, descrição, cor
- Visualização no mapa como linhas coloridas

### 4. Gerenciamento de CTOs (Customer Terminal Objects)
- Cadastro, edição e exclusão de CTOs
- Campos: nome, latitude, longitude, capacidade, endereço, status
- Ícone: Pin de localização (cor laranja padrão)

### 5. Gerenciamento de Fibras
- Gerenciamento individual de fibras dentro de cada cabo
- 12 cores padrão de fibras
- Status: Livre, Em Uso, Reservada
- Atribuição de cliente para fibras em uso

### 6. Gerenciamento de Conexões CTO
- Conexões entre CTOs
- Campos: nome, CTO origem, CTO destino, cor, status
- Visualização no mapa como linhas tracejadas

### 7. Mapa Interativo
- Visualização de todos os elementos no mapa
- Duas camadas: Mapa Padrão (OpenStreetMap) e Satélite
- Marcadores clicáveis com informações em popups
- Zoom automático para ajustar aos POPs cadastrados

---

## Estrutura do Projeto

### Componentes Principais

```
src/
├── components/
│   ├── Dashboard.tsx           # Layout principal
│   ├── Login.tsx              # Tela de autenticação
│   ├── MapView.tsx            # Visualização do mapa
│   ├── Sidebar.tsx            # Navegação lateral
│   └── forms/
│       ├── CaboForm.tsx       # Formulário de cabos
│       ├── CtoForm.tsx        # Formulário de CTOs
│       ├── CtoConexaoForm.tsx # Formulário de conexões CTO
│       ├── FibraManager.tsx   # Gerenciador de fibras
│       └── PopForm.tsx        # Formulário de POPs
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
└── lib/
    ├── mapIcons.ts            # Ícones do mapa
    └── supabase.ts            # Cliente Supabase
```

### Banco de Dados

#### Tabelas

1. **pops** - Points of Presence
   - id, nome, latitude, longitude, endereco, descricao, icone, created_at, created_by

2. **cabos** - Cabos de fibra óptica
   - id, nome, tipo, capacidade, comprimento, descricao, cor, coordenadas, status, created_at, created_by

3. **ctos** - Customer Terminal Objects
   - id, nome, latitude, longitude, capacidade, endereco, status, icone, cabo_id, created_at, created_by

4. **fibras** - Fibras individuais
   - id, cabo_id, numero, cor, status, cliente, created_at

5. **cto_conexoes** - Conexões entre CTOs
   - id, nome, cto_origem_id, cto_destino_id, cor, coordenadas, status, created_at, created_by

6. **user_profiles** - Perfis de usuários
   - id, email, full_name, role, is_active, created_at, updated_at

---

## Cores Padrão

- **POPs**: Verde (#10B981)
- **CTOs**: Laranja (#F59E0B)
- **Cabos**: Azul (#3B82F6)

---

## Como Usar

### 1. Login
- Acesse o sistema com email e senha
- Cadastre-se se for novo usuário

### 2. Adicionar POPs
- Clique no ícone de Pin na barra lateral
- Preencha nome, coordenadas e endereço
- Clique em Salvar

### 3. Adicionar Cabos
- Clique no ícone de Cabo na barra lateral
- Preencha os dados do cabo
- Escolha uma cor personalizada se desejar
- Salve o cabo

### 4. Adicionar CTOs
- Clique no ícone de Caixa na barra lateral
- Preencha os dados da CTO
- Associe a um cabo se necessário
- Salve a CTO

### 5. Gerenciar Fibras
- Clique no ícone de WiFi na barra lateral
- Selecione um cabo
- Adicione fibras com número, cor e status
- Atribua cliente se a fibra estiver em uso

### 6. Visualizar no Mapa
- Todos os elementos aparecem automaticamente no mapa
- Clique nos marcadores para ver informações
- Alterne entre mapa padrão e satélite no controle superior direito

---

## Compilação

```bash
npm run build
```

O projeto compila com sucesso e gera os arquivos na pasta `dist/`.

---

## Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Mapa**: Leaflet + React Leaflet
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React

---

## O que foi Removido da Versão Anterior

Esta versão 5 é uma simplificação que removeu:
- Sistema de desenho avançado de rotas
- Painel administrativo
- Configurações de sistema
- Gestão de usuários e permissões
- Sistema de auditoria
- Logs de segurança
- Backup e restore
- Cores configuráveis (agora são fixas)

---

## Conclusão

A Versão 5 é focada em simplicidade e funcionalidades essenciais para documentação de rede de fibra óptica. Todas as operações básicas de CRUD estão disponíveis com visualização em mapa interativo.
