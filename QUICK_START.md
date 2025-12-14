# 🚀 Guia Rápido - Começar com Kaizen Flow

Seja bem-vindo ao Kaizen Flow! Este guia ajudará você a criar seu primeiro fluxograma de melhoria contínua em 5 minutos.

---

## ⚡ 5 Passos para Começar

### Passo 1: Abrir o Editor Kaizen Flow

```
1. Na tela principal, crie uma nova task ou abra uma existente
2. Clique no ícone "📊" (Fluxograma) na task
3. O editor Kaizen Flow abrirá em tela cheia
```

### Passo 2: Começar com um Problema

```
Todos os fluxogramas Kaizen começam com um PROBLEMA:

🔴 Problema Identificado
   ↓
   Defina claramente qual é o problema
   Exemplo: "Tempo de processamento: 48 horas"
```

**Como adicionar:**
1. Aba "⚙️ Controles" já está ativa
2. Clique no botão 🔴 (Problema Identificado)
3. Novo nó apareça no canvas
4. Clique nele para editar (aba "📊 Métricas")

### Passo 3: Analisar Causas

```
🔴 Problema
   ↓
🟡 Análise de Causa Raiz (adicione 3-5)
   ├─ Por que isso acontece?
   ├─ Por que é assim?
   └─ Qual é a causa fundamental?
```

**Como adicionar:**
1. Clique no botão 🟡 (Análise) na aba Controles
2. Repita 3-5 vezes para explorar causas
3. Edite os labels de análise (duplo clique no nó)
4. Mova os nós com ↑↓ se necessário

### Passo 4: Definir Soluções

```
🟡 Análise
   ↓
🟢 Solução Implementada (adicione 1-3)
   └─ Como vamos resolver?
```

**Como adicionar com métricas:**
1. Clique no botão 🟢 (Solução)
2. Selecione o nó criado
3. Mude para aba "📊 Métricas"
4. Preencha:
   - ⏱️ Tempo: Quantas horas levará?
   - 💰 Custo: Qual é o investimento?
   - 📈 Impacto: Quanto melhorará? (0-100)

### Passo 5: Validar e Decidir

```
🟢 Solução
   ↓
🔵 Validação/Teste
   ↓
⚪ Decisão
```

**Como finalizar:**
1. Adicione nó 🔵 para teste
2. Adicione nó ⚪ para decisão final
3. Clique "💾 Salvar Kaizen Flow"
4. Dados salvos automaticamente

---

## 🎨 Elementos Principais

### Nós (Blocos Coloridos):

| Emoji | Nome | O que é | Quando usar |
|-------|------|---------|-------------|
| 🔴 | Problema | Situação indesejada | Sempre no início |
| 🟡 | Análise | Investigação | Múltiplas vezes |
| 🟢 | Solução | Ação corretiva | 1-3 por fluxo |
| 🔵 | Validação | Teste/verificação | Antes de implementar |
| ⚪ | Decisão | Aprovação | Ponto final |

### Botões Principais:

```
📜 Histórico    → Ver todas as mudanças (com horários)
🔀 Comparar     → Ver versão anterior vs atual
📥 Exportar     → Baixar como SVG ou PNG
✏️ Editar       → Mudar label do nó selecionado
💾 Salvar       → Guardar fluxograma na base de dados
✕ Cancelar      → Fechar sem salvar
```

---

## 📊 Preenchendo Métricas

As métricas ajudam a tomar decisões baseadas em dados:

### ⏱️ Tempo (Horas)
```
Exemplo: 8h para implementação
├─ Desenvolvimento: 5h
├─ Testes: 2h
└─ Documentação: 1h

Dica: Use decimais (0.5 = 30 minutos)
```

### 💰 Custo (Reais)
```
Exemplo: R$ 2.000 para consultoria
├─ Profissional: R$ 1.500
├─ Ferramentas: R$ 400
└─ Materiais: R$ 100

Dica: Deixe em branco se custo é zero
```

### 📈 Impacto (0-100)
```
Exemplo: 85 de impacto esperado
├─ 0-33   = Baixo impacto
├─ 34-66  = Médio impacto
└─ 67-100 = Alto impacto

Dica: Seja realista, não otimista
```

---

## 🎯 Exemplo Prático (2 min)

Criar fluxograma: "Reduzir tempo de reunião"

```
PASSO 1: Problema
┌─────────────────────────────────────┐
│ 🔴 Problema                         │
│ Label: "Reunião leva 1h (meta: 20m)"│
└─────────────────────────────────────┘

PASSO 2: Análises
┌─────────────────────────────────────┐
│ 🔴 Problema                         │
│         ↓                           │
│ 🟡 Análise 1: "Muitos participantes"│
│ 🟡 Análise 2: "Sem agenda prévia"   │
│ 🟡 Análise 3: "Falta de time-box"   │
└─────────────────────────────────────┘

PASSO 3: Soluções
┌─────────────────────────────────────┐
│ 🟡 Análises                         │
│         ↓                           │
│ 🟢 Solução 1: "Enviar agenda 24h antes" │
│   ⏱️ 1h  💰 R$0  📈 60              │
│                                     │
│ 🟢 Solução 2: "Time-box de 20 min"  │
│   ⏱️ 0.5h 💰 R$0 📈 80              │
└─────────────────────────────────────┘

PASSO 4: Validação
┌─────────────────────────────────────┐
│ 🟢 Soluções                         │
│         ↓                           │
│ 🔵 Validação: "Testar por 2 semanas"│
│   ⏱️ 80h 💰 R$0  📈 90              │
│         ↓                           │
│ ⚪ Decisão: "Aprovar para todos?"    │
│   ⏱️ 1h  💰 R$0  📈 100             │
└─────────────────────────────────────┘

TOTAL: 82.5 horas, R$ 0, Impacto: 82
```

**Resultado esperado:** Redução de 60 min → 20 min (-67%)

---

## 💡 Dicas Rápidas

### ✅ Faça:

```
✓ Comece com problema bem definido
✓ Explore pelo menos 3 causas
✓ Preencha todas as métricas
✓ Use labels descritivos
✓ Valide antes de implementar
✓ Exporte versão final
✓ Salve frequentemente (Ctrl+S ou botão)
```

### ❌ Evite:

```
✗ Começar direto com solução
✗ Usar apenas um nó de análise
✗ Deixar métricas vazias
✗ Labels muito genéricos ("Melhorar", "Fazer")
✗ Pular validação
✗ Fechar sem salvar
```

---

## 🎓 Suas Primeiras 3 Ações

### 1️⃣ Criar um Fluxograma Simples (5 min)
```
Objetivo: Praticar a interface
├─ Problema + 2 análises
├─ 1 solução com métricas
└─ Exportar como PNG
```

### 2️⃣ Criar um Fluxograma Real (30 min)
```
Objetivo: Resolver problema verdadeiro
├─ Usar estrutura completa
├─ 3+ análises profundas
├─ Múltiplas soluções
└─ Preencher todas as métricas
```

### 3️⃣ Apresentar e Implementar (1 dia)
```
Objetivo: Compartilhar e começar ação
├─ Exporte como PNG para apresentação
├─ Compartilhe com o time
├─ Implemente solução
└─ Monitore validação
```

---

## 🔧 Troubleshooting Rápido

### P: O nó não foi criado
**R:** Clique no botão (tipo de nó) e aguarde 1s. Deverá aparecer à direita.

### P: Como editar um nó?
**R:** Aba "📊 Métricas" → Selecione nó → Edite label e métricas

### P: Perdi minhas mudanças
**R:** Clique "📜 Histórico" para ver versões anteriores

### P: Como mover nó de posição?
**R:** Selecione nó na lista → Use botões ↑ ou ↓

### P: Arquivo PNG não salva
**R:** Verifique permissões de downloads. Use SVG como alternativa.

### P: Meu fluxograma está muito grande
**R:** Use filtro 🔍 para ver apenas um tipo de nó por vez

---

## 📚 Próximos Passos

Após criar seu primeiro fluxograma:

1. **Leia:** `KAIZEN_FEATURES.md` para recursos avançados
2. **Estude:** `KAIZEN_EXAMPLES.md` para inspiração
3. **Consulte:** `CHANGELOG_TECHNICAL.md` se precisar detalhar

---

## ⏱️ Tempo de Aprendizado

| Nível | Tempo | O que faz |
|-------|-------|----------|
| 🟢 Iniciante | 10 min | Criar fluxograma simples |
| 🟡 Intermediário | 1 hora | Fluxogramas com métricas |
| 🔴 Avançado | 1 dia | Múltiplos fluxogramas, exportação |
| ⚫ Expert | 1 semana | Estratégia de melhoria contínua |

---

## 🎉 Parabéns!

Você está pronto para começar com Kaizen Flow!

**Dica final:** Salve seus fluxogramas regularmente e exporte versões importantes.
Assim você terá histórico de melhorias da sua organização.

---

**Versão**: 1.0
**Data**: Novembro 2025
**Próxima leitura sugerida**: KAIZEN_EXAMPLES.md
