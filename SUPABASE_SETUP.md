# Turion - Setup do Supabase

## 📋 Instruções de Configuração

### 1. Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Crie um novo projeto ou acesse seu projeto existente

### 2. Execute o SQL Schema
1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** para executar

### 3. Configure as Variáveis de Ambiente
Adicione ao seu `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure OAuth no Supabase
1. Vá para **Authentication > Providers**
2. Habilite **Google** e configure:
   - Client ID do Google Cloud Console
   - Client Secret do Google Cloud Console
3. Adicione as URLs de callback:
   - `https://seu-projeto.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

---

## 📊 Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (nome, avatar, stripe_customer_id) |
| `api_keys` | Chaves de API dos usuários |
| `subscriptions` | Assinaturas e planos |
| `usage_logs` | Logs de uso da API |
| `monthly_usage` | View materializada para dashboard |

---

## 🔐 Planos e Limites

| Plano | Preço | Requisições/mês |
|-------|-------|-----------------|
| Free | £0 | 100 |
| Starter | £7 | 5.000 |
| Growth | £25 | 25.000 |
| Scale | £79 | 100.000 |

---

## ✅ Verificar Setup

Execute estas queries no SQL Editor para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar se RLS está ativo
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 🧪 Dados de Teste (Opcional)

Para testar manualmente:

```sql
-- Criar um usuário de teste (após se registrar via auth)
-- O trigger cria automaticamente profile e subscription

-- Ver dados do usuário
SELECT * FROM profiles WHERE email = 'seu-email@teste.com';

-- Criar uma API key de teste
INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
VALUES (
    'uuid-do-usuario',
    'Test Key',
    'hash-da-chave',
    'tur_test'
);

-- Ver uso mensal
SELECT * FROM monthly_usage;
```

---

## 🚀 Próximos Passos

1. ✅ Execute o SQL no Supabase
2. ✅ Configure as variáveis de ambiente
3. ✅ Configure Google OAuth
4. ✅ Configure Stripe Webhooks
5. ✅ Teste o fluxo de registro/login
