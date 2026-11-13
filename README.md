# Editora Espectro

Site da editora e arquivo da Revista Espectro. O frontend usa React, TypeScript e Vite. O Supabase guarda os textos, as edições, os originais e as inscrições.

## Desenvolvimento

Use uma configuração Supabase de desenvolvimento e mantenha a chave de serviço no ambiente das funções, fora do frontend.

```sh
npm ci
npm run dev
npm run test
npm run build
```

O frontend usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Para validar fluxos de escrita, use um banco e um bucket de teste.

## Publicação

O repositório usa o fallback de rotas do Vercel em `vercel.json`. Para publicar a revisão editorial em um ambiente existente, coordene o frontend e a atualização do Supabase na mesma janela:

1. Valide a migração `20261113162500_editorial_flows.sql` em um ambiente de teste. Ela cria as funções de inscrição e ranking, restringe a edição aos papéis do painel e torna privado o bucket de originais. Os links públicos antigos de originais deixam de funcionar quando a migração é aplicada. O painel passa a baixar os arquivos com a sessão do administrador.
2. Aplique a migração e publique as Edge Functions `handle-submission` e `send-newsletter`. A função de aviso de submissão usa `RESEND_API_KEY` e aceita `SUBMISSIONS_FROM_EMAIL` para o remetente verificado. `SITE_URL` permite incluir no aviso um link para o painel editorial.
3. Publique o frontend e confira a leitura de edições, a busca, o formulário de originais e o download autenticado. Para inscrições, confirme o registro usando um e-mail de teste e repita a inscrição para verificar que ela é idempotente.

A Frequência Espectro registra inscrições. Para voltar a oferecer envio automático é preciso implementar a entrega com um provedor e um fluxo de cancelamento de inscrição. A função atual retorna indisponibilidade sem consultar a lista de e-mails.
