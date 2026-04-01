# Ajuste no Supabase para isolamento por setor

O bug de navegação foi corrigido no frontend. No Supabase, o que resta fazer é corrigir dados já gravados no setor errado.

## 1. `sidebar_items`: conferir o que foi salvo em `consultoria`

Rode no SQL Editor:

```sql
select
  sector,
  count(*) as total
from public.sidebar_items
group by sector
order by sector;
```

Para inspecionar os itens recentes de `consultoria`:

```sql
select
  id,
  title,
  sector,
  path,
  is_custom,
  is_hidden,
  created_at,
  updated_at
from public.sidebar_items
where sector = 'consultoria'
order by created_at desc nulls last;
```

## 2. `sidebar_items`: mover os registros que deveriam estar em `fertilizantes-sucroenergético`

### 2.1 Itens personalizados (`is_custom = true`)

Use para itens criados com UUID, trocando os IDs certos:

```sql
update public.sidebar_items
set
  sector = 'fertilizantes-sucroenergético',
  path = replace(
    path,
    '/app/setor/consultoria/custom/',
    '/app/setor/fertilizantes-sucroenergético/custom/'
  ),
  updated_at = now()
where id in (
  'COLOQUE_AQUI_O_ID_1',
  'COLOQUE_AQUI_O_ID_2'
);
```

### 2.2 Itens padrão renomeados (`id` começa com `renamed:`)

```sql
update public.sidebar_items
set
  id = replace(id, 'renamed:consultoria:', 'renamed:fertilizantes-sucroenergético:'),
  sector = 'fertilizantes-sucroenergético',
  updated_at = now()
where id in (
  'renamed:consultoria:/app/algum-caminho'
);
```

### 2.3 Itens padrão ocultados (`id` começa com `hidden:`)

```sql
update public.sidebar_items
set
  id = replace(id, 'hidden:consultoria:', 'hidden:fertilizantes-sucroenergético:'),
  sector = 'fertilizantes-sucroenergético',
  updated_at = now()
where id in (
  'hidden:consultoria:/app/algum-caminho'
);
```

## 3. Índice recomendado para `sidebar_items`

O app sempre busca por `sector` e ordena por `created_at`. Se esse índice ainda não existir:

```sql
create index if not exists sidebar_items_sector_created_at_idx
  on public.sidebar_items (sector, created_at);
```

## 4. `reports` bucket: mover PDFs do setor errado

Os relatórios não ficam em tabela SQL. Eles ficam no bucket `reports`, em pastas por setor:

- `consultoria/...`
- `agroeconomics/...`
- `fertilizantes-sucroenergético/...`

Se algum PDF de fertilizantes entrou em `consultoria/`, mova no Storage:

1. Abra `Storage` no Supabase.
2. Entre no bucket `reports`.
3. Localize o arquivo em `consultoria/...`.
4. Mova para `fertilizantes-sucroenergético/...`.

Se preferir via código, use `storage.move` no mesmo bucket:

```ts
const { error } = await supabase.storage
  .from("reports")
  .move(
    "consultoria/1712345678901-relatorio.pdf",
    "fertilizantes-sucroenergético/1712345678901-relatorio.pdf",
  );
```

Referencia oficial: https://supabase.com/docs/guides/storage/management/copy-move-objects

## 5. Conferência final

Depois da limpeza:

```sql
select
  id,
  title,
  sector,
  path,
  is_custom,
  is_hidden
from public.sidebar_items
where sector in ('consultoria', 'fertilizantes-sucroenergético')
order by sector, created_at asc nulls last;
```

Se voce quiser, o proximo passo e eu montar um SQL ja preenchido com base nos IDs exatos que existirem hoje no seu projeto Supabase.
