# RIO SOL Academy - Documentação Técnica e Funcional

## Visão Geral do Sistema

O **RIO SOL Academy** é uma plataforma de treinamento e capacitação avançada para vendedores do setor de energia solar. Com uma abordagem inovadora, o sistema combina **educação tradicional (Trilhas de Conteúdo)** com **inteligência artificial (Laboratório de Roleplay)** e **gamificação (XP, Níveis, Ranking e Ofensivas)** para engajar e acelerar a curva de aprendizado da equipe comercial.

---

## Arquitetura Técnica

- **Frontend**: Desenvolvido em **React 19** utilizando **Vite** para build super-rápido, **Tailwind CSS** para estilização utilitária e **Shadcn UI** para componentes de interface acessíveis e modernos. O código é inteiramente escrito em **TypeScript**.
- **Backend / Banco de Dados**: Utiliza o **Supabase** como infraestrutura de Backend-as-a-Service (BaaS), provendo o banco de dados PostgreSQL relacional, sistema de Autenticação e armazenamento seguro.
- **Roteamento e Estado**: O gerenciamento de rotas é feito via **React Router DOM**, enquanto o estado das sessões, usuários e configurações administrativas é mantido por stores sincronizadas assincronamente com o Supabase.

---

## Estrutura de Banco de Dados (Supabase)

A arquitetura de dados baseia-se em 4 tabelas fundamentais que garantem a persistência e a lógica do sistema:

1. **`profiles` (Perfis)**: Armazena os dados estendidos dos usuários (vendedores e administradores), atrelados ao sistema de autenticação `auth.users`. Guarda informações essenciais de gamificação, como pontuação total (`xp_total`), sequência de estudos ininterrupta (`current_streak`), e a permissão de controle de acesso (`is_admin`).
2. **`activities` (Atividades)**: Registra todo o histórico de ações dos usuários na plataforma (como leitura de aulas finalizadas, simulações de roleplay, etc.). É a base para calcular pontuações, extrair métricas de desempenho e estabelecer o ranqueamento.
3. **`content` (Conteúdos / CMS)**: A biblioteca de estudos. Guarda as informações das trilhas e lições, incluindo título, descrição, links de vídeos, capa (thumbnail) e as categorias.
4. **`system_settings` (Configurações do Sistema)**: Controles globais da plataforma gerenciados pelos administradores (ex: ativar/desativar modo ofensiva global, atualizar a mensagem de "Foco da Semana").

---

## Funcionalidades Principais (Visão do Vendedor)

### 1. Painel Principal (Minha Jornada)

- **Dashboard Resumido**: O vendedor acompanha rapidamente seu Nível atual, seu progresso percentual em XP, e recebe diretrizes importantes da gestão através do painel de "Foco da Semana".
- **Modos de Treinamento**: Possui integração com um modo focado (Ofensiva/Streak) onde o vendedor é incentivado a manter a constância de acessos e treinamentos diários.

### 2. Painel de Conteúdos (Trilhas de Aprendizado)

- Onde a capacitação teórica acontece. O catálogo é categorizado em módulos cruciais como: **Cultura, Técnico e Psicologia**.
- O vendedor consome conteúdos dinâmicos com vídeos e materiais complementares de leitura.
- O consumo gera registros automáticos de atividades, somando pontos de XP ao progresso pessoal.

### 3. Laboratório de Roleplay (Simulador IA)

- O diferencial competitivo da plataforma. O vendedor simula negociações e objeções de vendas reais contra diferentes "Personas" alimentadas pelo sistema.
- Durante a simulação, é avaliado em tempo real critérios fundamentais: **Persuasão, Clareza, Tom de voz (Empatia) e Aderência ao Framework de Vendas**.
- Ao final, uma nota analítica é gerada, apontando pontos fortes e oportunidades de melhoria (o que converte em experiência de jogo).

### 4. Meu Desempenho

- Área analítica pessoal. Permite ao usuário visualizar toda a sua curva de aprendizado, histórico de atividades concluídas e a média histórica das pontuações atingidas no laboratório neural (IA).

### 5. Ranking Global

- _Leaderboard_ interativo que fomenta uma competição saudável entre a força de vendas.
- Ranqueia todos os arquitetos e vendedores pela sua "Energia XP", exibindo posições de destaque (Top 3) e progresso relativo dos demais membros em suas respectivas divisões.

### 6. Perfil e Conquistas

- Exibição de insígnias, medalhas e árvore de hierarquia RIO SOL. Níveis atuais:
  1. **Iniciante** (0 a 999 XP)
  2. **Consultor Júnior** (1.000 a 2.999 XP)
  3. **Consultor Pleno** (3.000 a 4.999 XP)
  4. **Consultor Sênior** (5.000 a 9.999 XP)
  5. **Arquiteto Solar** (Acima de 10.000 XP)

---

## Painel Administrativo (Visão CEO / Gestor)

_Acessível apenas para usuários sinalizados com `is_admin = true`._

### 1. Centro de Comando Zenith (Dashboard de Gestão)

- O gestor acompanha de perto os KPIs de adoção da plataforma: engajamento da base, conteúdos mais acessados e os vendedores com as maiores pontuações.
- Permite ações de controle sistêmico, como editar a notificação "Foco da Semana", que impacta a tela inicial de toda a equipe de vendas.

### 2. Gestão de Conteúdo (CMS)

- Ferramenta nativa para a criação, edição e remoção dos materiais educacionais (`/admin/tracks`).
- Suporta informações de categorização, thumbnail e inserção de link de mídia, refletindo instantaneamente para a força de vendas.

### 3. Auditoria de Desempenho de Usuários

- Acesso a um relatório profundo por vendedor, acompanhando dias de "Ofensiva" ativos, porcentagem geral de conclusão de trilhas e um detalhamento individual das simulações mais recentes do vendedor analisado.

---

## Gestão de Mídias e Vídeos das Trilhas

Conforme projetado pela arquitetura do sistema, o **Supabase** é capaz de comportar vídeos próprios utilizando o _Supabase Storage_, no entanto, o modelo atual mais prático e recomendado para o RIO SOL Academy é o uso de **Links Externos**.

1. **Eficiência e Custos**: Utilizar o **YouTube** ou **Vimeo** evita que a plataforma consuma altas taxas de armazenamento e banda do banco de dados, usufruindo de sistemas profissionais de _streaming_ adaptativo nativo destas plataformas de vídeo.
2. **Como Inserir**:
   - Faça o upload da aula no seu canal do YouTube/Vimeo e defina a privacidade como "Não Listado" (dessa forma, não aparece publicamente nas buscas).
   - Copie o URL da aula.
   - Navegue pelo Menu do **Painel Admin > Gestão de Conteúdo > Novo Conteúdo**, preencha os dados e cole o link do vídeo. O sistema cuidará da exibição integrada.

---

## Mecânica da Gamificação (Distribuição de XP)

- O progresso do usuário avança exclusivamente por interações computadas na tabela `activities`.
- Ao completar aulas, módulos ou finalizar rodadas avaliadas pela IA no Simulador de Roleplay, novos eventos são persistidos.
- A soma desses scores alimentará o campo de `xp_total` e refletirá de forma reativa a progressão visual, o desbloqueio da barra percentual para o próximo cargo e a flutuação do consultor dentro do Ranking Global.
