# Painel de Prospecção — Market Pro Ads

Dashboard profissional para gestão e prospecção de leads, hospedado em GitHub, Vercel e Supabase.

## 🚀 Guia de Configuração Completo

### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `painel-prospeccao`
3. Descrição: `Painel de Prospecção Market Pro Ads`
4. Selecione "Public"
5. Clique em "Create repository"

### Passo 2: Conectar Repositório Local ao GitHub

```bash
cd "Nova pasta"
git config user.email "contato@marketproads.com"
git config user.name "Market Pro Ads"
git add .
git commit -m "Initial commit: Painel de Prospecção v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/painel-prospeccao.git
git push -u origin main
```

*Substitua `SEU_USUARIO` pelo seu usuário do GitHub.*

### Passo 3: Configurar Supabase

#### 3.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: `painel-prospeccao`
   - **Database Password**: Guarde com segurança
   - **Region**: Escolha a mais próxima (ex: South America/São Paulo)
5. Clique em "Create new project"

#### 3.2 Obter Credenciais
1. Após criar o projeto, vá para **Settings** → **API**
2. Copie:
   - `Project URL` → será sua `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → será sua `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3.3 Criar a Tabela `lead_states` (obrigatório)

Os ~milhares de leads (dados de CNPJ) já vêm embutidos no `index.html` — isso não muda.
O que precisa vir do Supabase é apenas o **estado de prospecção** de cada lead (status
no funil e anotações), para persistir entre sessões e dispositivos.

No editor SQL do Supabase (**SQL Editor** → **New query**), execute:

```sql
CREATE TABLE lead_states (
  cnpj TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'novo',
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_states ENABLE ROW LEVEL SECURITY;

-- Este painel não tem login: qualquer pessoa com o link do site
-- (usando a chave anônima) pode ler e atualizar o status dos leads.
CREATE POLICY "Public read access" ON lead_states
  FOR SELECT USING (true);
CREATE POLICY "Public write access" ON lead_states
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON lead_states
  FOR UPDATE USING (true);
```

#### 3.4 Criar a Tabela `app_settings` (obrigatório para o script editável)

O painel tem um botão **"✏️ Editar"** no script de ligação, que salva o texto
editado no Supabase (vale para todas as empresas). Sem esta tabela, a edição
funciona só durante a sessão atual (não persiste ao recarregar a página).

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON app_settings
  FOR SELECT USING (true);
CREATE POLICY "Public write access" ON app_settings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON app_settings
  FOR UPDATE USING (true);
```

#### 3.5 Criar a Tabela `pipeline_stages` (obrigatório para editar as etapas do funil)

O painel tem um botão **"⚙️ Etapas"** na barra de ferramentas, que permite editar,
reordenar, adicionar e remover as etapas do funil (Novo, Tentando contato, etc.).
Sem esta tabela, as mudanças funcionam só durante a sessão atual.

```sql
CREATE TABLE pipeline_stages (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8a8fa3',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON pipeline_stages
  FOR SELECT USING (true);
CREATE POLICY "Public write access" ON pipeline_stages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON pipeline_stages
  FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON pipeline_stages
  FOR DELETE USING (true);
```

Na primeira vez que o painel carregar com essa tabela vazia, ele preenche
automaticamente com as 7 etapas padrão (Novo, Tentando contato, Contato feito,
Reunião marcada, Proposta enviada, Fechado, Perdido). A etapa "Novo" não pode
ser removida pela interface (é o status padrão de toda empresa ainda não
trabalhada), mas pode ser renomeada.

> ⚠️ Como não há autenticação, essas políticas liberam leitura/escrita para
> quem tiver a URL do site. Isso é aceitável para uso interno da equipe, mas
> se o painel for exposto publicamente, considere adicionar login (Supabase Auth)
> e trocar `USING (true)` por uma checagem de usuário autenticado.

### Passo 4: Configurar Vercel

#### 4.1 Conectar GitHub ao Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Import Project"
4. Selecione `painel-prospeccao` do seu GitHub
5. Clique em "Import"

#### 4.2 Adicionar Variáveis de Ambiente
1. Na página do projeto no Vercel, vá para **Settings** → **Environment Variables**
2. Adicione:
   - **NEXT_PUBLIC_SUPABASE_URL**: Cole a URL do Supabase
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Cole a chave anônima do Supabase
3. Clique em "Save"

#### 4.3 Deploy
1. Clique em "Deploy"
2. Aguarde o build terminar (~2-3 min)
3. Seu site estará disponível em: `https://painel-prospeccao-<seu-username>.vercel.app`

### Passo 5: Configurar Variáveis Locais (Opcional)

Crie um arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Não commite este arquivo!** Está no `.gitignore`.

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar servidor local
npm run dev

# Acesse em http://localhost:3000
```

---

## 🔗 Como a Integração com Supabase Funciona

O `index.html` é um arquivo estático — não roda um framework nem tem acesso a
variáveis de ambiente em tempo de execução. Para não deixar as credenciais do
Supabase fixas no código-fonte versionado, usamos um pequeno passo de build:

1. `index.html` contém os placeholders `__SUPABASE_URL__` e `__SUPABASE_ANON_KEY__`
   dentro do `<script type="module">`.
2. `build.js` lê `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (do `.env.local` localmente, ou das Environment Variables do Vercel em produção)
   e substitui os placeholders, gerando `dist/index.html`.
3. O Vercel serve o conteúdo de `dist/` (configurado em `vercel.json`).

No código, as funções `loadStates()` e `setState()` (dentro do `<script>` do
`index.html`) leem e gravam o status/anotações de cada lead na tabela
`lead_states` do Supabase, usando o `cnpj` como chave.

---

## 📋 Checklist Rápido

- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Supabase projeto criado e credenciais copiadas
- [ ] Vercel conectado ao GitHub
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado no Vercel
- [ ] Site acessível publicamente

---

## 🆘 Troubleshooting

**Erro ao fazer deploy no Vercel:**
- Verifique se as variáveis de ambiente estão configuradas
- Verifique se o arquivo `vercel.json` está correto

**Erro de conexão com Supabase:**
- Confirme que a URL e a chave foram copiadas corretamente
- Verifique se a chave anônima está com permissões públicas

**Erro 404 no Vercel:**
- Verifique se o `index.html` está na raiz do projeto
- Certifique-se de que o `vercel.json` tem a rewrite correta

---

## 📞 Suporte

Email: contato@marketproads.com

---

**Versão**: 1.0.0  
**Última atualização**: 2026-07-03
