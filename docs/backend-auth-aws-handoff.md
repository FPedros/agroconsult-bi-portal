# Handoff Frontend -> Backend/Auth/AWS

## Escopo atual do sistema

Frontend React + Vite com estado local de sessão e persistência funcional ainda acoplada ao Supabase.

Estrutura atual do repositório:

- app frontend em `frontend/`
- documentação em `docs/`
- raiz reservada para futura camada backend/infra

Setores ativos no produto:

- `consultoria`
- `agroeconomics`
- `fertilizantes-sucroenergético`

Funcionalidades hoje implementadas no frontend:

- login local mock
- navegação por setor
- links de Power BI por setor/painel
- itens customizados da sidebar por setor
- biblioteca de relatórios por setor
- upload de relatório com `titulo`, `descricao`, `imagem de capa` e `pdf`

## Limpeza já feita

Removidos do código:

- setores legados (`financeiro`, `avaliacao-ativos`, `comunicacao`, `levantamento-safra`, `projetos`, `desenvolvimento-inovacao`)
- defaults encoded de Power BI
- `mvpUsers`
- páginas `TestPage`, `FinanceiroPage`, `AvaliacaoAtivosPage`
- rotas especiais antigas de consultoria

O app agora usa o padrão único:

- painéis: `/app/setor/:sectorId/:panelId`
- item customizado: `/app/setor/:sectorId/custom/:itemId`
- perfil: `/app/perfil`
- upload de relatório: `/app/perfil/relatorios`

## Pontos de integração atuais

### Auth mock

Arquivos:

- [LandingPage.tsx](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/pages/LandingPage.tsx)
- [UserContext.tsx](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/contexts/UserContext.tsx)
- [mockAuth.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/mockAuth.ts)

Estado atual:

- sessão só vive em memória
- não existe token
- não existe refresh token
- não existe proteção por backend
- `ProtectedAppLayout` só verifica se `user` existe em contexto

Substituição esperada:

- trocar `authenticateLocalUser()` por chamada real de login
- persistir sessão segura
- popular `UserContext` a partir do backend/auth provider
- proteger rotas com sessão validada

### Persistência atual via Supabase

Cliente:

- [supabaseClient.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/supabaseClient.ts)

Módulos acoplados ao Supabase:

- [powerBiRepository.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/powerBiRepository.ts)
- [sidebarItems.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/sidebarItems.ts)
- [reports.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/reports.ts)

Esses 3 arquivos são o ponto principal a substituir na migração para AWS/backend próprio.

## Modelo funcional atual

### 1. Power BI

Tabelas usadas:

- `sectors`
- `powerbi_links`

Contrato atual no frontend:

- buscar link por `sectorSlug + panel`
- criar setor se não existir
- criar/atualizar link do painel

Painéis esperados:

- `comercial`
- `operacional`
- `financeiro`
- `principal`

### 2. Sidebar por setor

Tabela usada:

- `sidebar_items`

Uso atual:

- itens customizados
- rename de item base
- hide de item base
- link Power BI para item customizado

Observação:

- itens padrão não ficam em tabela base; eles nascem do frontend em [sidebarMenu.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/sidebarMenu.ts)
- apenas overrides ficam persistidos

### 3. Relatórios

Persistência atual:

- bucket `reports`
- tabela `report_entries`

Contrato atual:

- `report_entries` guarda metadados do card
- storage guarda PDF e imagem
- arquivos antigos sem metadados ainda aparecem como `legacy`

SQL da tabela:

- [report-entries.sql](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/docs/report-entries.sql)

## Rotas importantes do frontend

- `/` login
- `/app` seleção de setor
- `/app/setor/:sectorId` landing do setor
- `/app/setor/:sectorId/:panelId` painel Power BI
- `/app/setor/:sectorId/custom/:itemId` item customizado da sidebar
- `/app/itens-sidebar` gestão da sidebar do setor atual
- `/app/powerbi` gestão de links Power BI do setor atual
- `/app/relatorios` biblioteca de relatórios do setor atual
- `/app/perfil` cadastro
- `/app/perfil/relatorios` upload de relatório

## Sugestão de migração para backend próprio

### Auth

Opções:

- AWS Cognito
- JWT próprio com backend

Necessidades mínimas:

- login
- logout
- recuperar sessão
- usuário autenticado
- autorização por setor/perfil

Sugestão de contrato:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`

### API de Power BI

Sugestão:

- `GET /sectors`
- `GET /sectors/:slug/powerbi/:panel`
- `PUT /sectors/:slug/powerbi/:panel`

### API de sidebar

Sugestão:

- `GET /sectors/:slug/sidebar-items`
- `POST /sectors/:slug/sidebar-items`
- `PATCH /sectors/:slug/sidebar-items/:id`
- `DELETE /sectors/:slug/sidebar-items/:id`
- `PUT /sectors/:slug/sidebar-items/base-title`
- `PUT /sectors/:slug/sidebar-items/base-visibility`

### API de relatórios

Sugestão:

- `GET /sectors/:slug/reports`
- `POST /sectors/:slug/reports`
- `DELETE /sectors/:slug/reports/:id`
- `POST /sectors/:slug/reports/upload-url`
- `POST /sectors/:slug/reports/image-upload-url`

## Sugestão de migração para AWS

### Storage

Hoje:

- Supabase Storage bucket `reports`

Destino sugerido:

- S3

Estrutura atual de chave:

- `sector-slug/arquivo.pdf`
- `sector-slug/_images/capa.png`

### Banco

Hoje:

- Postgres via Supabase

Destino sugerido:

- RDS Postgres

Tabelas mínimas a manter:

- `sectors`
- `powerbi_links`
- `sidebar_items`
- `report_entries`
- tabelas de auth/usuário conforme solução escolhida

### Entrega de arquivos

Hoje:

- signed URL do Supabase

Destino sugerido:

- presigned URLs S3 para upload/download

## Ajustes de frontend esperados na próxima etapa

Quando backend/auth estiverem prontos, substituir:

- [mockAuth.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/mockAuth.ts)
- [supabaseClient.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/supabaseClient.ts)
- [powerBiRepository.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/powerBiRepository.ts)
- [sidebarItems.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/sidebarItems.ts)
- [reports.ts](/c:/Users/fernando.sousa/Documents/Projects/agroeconomics-portal/frontend/src/lib/reports.ts)

## Risco atual conhecido

- `UserContext` ainda é só frontend e não persiste sessão
- frontend ainda fala direto com Supabase
- links de Power BI e uploads dependem de permissões do Supabase
- não existe camada de API intermediária

## Estado final esperado após integração

- frontend consumindo API própria
- auth real com sessão persistida
- arquivos em S3
- banco em AWS
- remoção completa da dependência `@supabase/supabase-js`
