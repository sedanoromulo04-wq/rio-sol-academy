# Relatório de Erros e Melhorias - Teste do Sistema

Durante os testes na aplicação web (http://127.0.0.1:8080), as seguintes falhas, erros de console e problemas de usabilidade (UX) foram identificados e precisam de correção:

## 1. Problemas Técnicos e Console
- **Erro de CORS**: O sistema tenta realizar requisições para `https://api.goskip.dev/v1/projects/config/public`, que são bloqueadas pela política de CORS (*Cross-Origin Resource Sharing*). Isso pode afetar configurações dinâmicas do ambiente "Skip".
- **Falha de Fetch**: O arquivo `skip.js` apresenta um erro `TypeError: Failed to fetch`, provavelmente derivado do bloqueio de CORS.
- **Erro 401 Silencioso no Login**: Durante a tentativa de login com credenciais inválidas, o console registra um erro 401 (Unauthorized) originado do Supabase, mas este erro não é capturado ou exibido para o usuário na interface.

## 2. Falhas de Interface e UX
- **Ausência de Cadastro**: Não existe um botão ou link para "Criar conta" ou "Cadastrar-se" na tela inicial. As rotas comuns como `/register` e `/signup` retornam um erro 404 genérico, impossibilitando a criação de novas contas.
- **Falta de Feedback no Login (Erro Crítico)**: Ao inserir um e-mail ou senha incorretos, o sistema não exibe nenhuma mensagem de erro (ex: "Credenciais inválidas"). O botão de login apenas muda brevemente para "Entrando..." e retorna ao estado original, deixando o usuário sem saber o que falhou.
- **Recuperação de Senha**: Não há opção de "Esqueci minha senha" disponível na interface de login.
- **Acessibilidade de Formulários**: Os campos de entrada de dados não possuem atributos `autocomplete` (como `current-password`), o que gera avisos no navegador e dificulta o uso de gerenciadores de senhas.

## 3. Navegação e Responsividade
- **Redirecionamento Inexistente**: Ao tentar acessar rotas internas protegidas (como `/dashboard` ou `/home`) sem estar logado, o sistema exibe uma página 404 em vez de redirecionar o usuário para a tela de login para se autenticar.
- **Sobreposição de Elementos (Badge do Skip)**: O selo "Criado com o Skip" ("Built with Skip") fixo no canto inferior direito pode sobrepor elementos de navegação importantes em dispositivos com telas muito pequenas ou que usem rodapés interativos.

### Próximos Passos
Recomenda-se como prioridade tratar os erros do Supabase para exibir toasts/alertas de erro no login, implementar as páginas de cadastro e recuperação de senha, e configurar *guards* nas rotas para proteger as páginas internas (redirecionando para `/login`).
