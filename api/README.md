# Rotas

🟣 Endpoint para o Frontend
🟪 Endpoint para consumir via API

## Auth (/v1/auth)

- 🟣 POST /v1/auth/sign-up (Registro)
- 🟣 POST /v1/auth/sign-in (Login)

## Spaces (/v1/spaces)

### CRUD do Space

- 🟣 POST /v1/spaces (Cria space)
- 🟣 PUT /v1/spaces/:spaceId (Edita space)
- 🟣 DELETE /v1/spaces/:spaceId (Deleta Space)

### Gerenciamento da API Key do Space

- 🟣 POST /v1/spaces/:spaceId/api-key (Gera API Key)
- 🟣 PUT /v1/spaces/:spaceId/api-key (Edita permissões da API Key)
- 🟣 DELETE /spaces/:spaceId/api-key/:apiKeyId (Remove a API Key)

### Gerencia tópicos do Space

- 🟣 POST /v1/spaces/:spaceId/topics (Cria Tópico)
- 🟣 GET /v1/spaces/:spaceId/topics (Lista tópicos do space)
- 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/subscribe (Se inscreve no tópico para receber mensagens e/ou notificações)
- 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/unsubscribe (Remove a inscrição do tópico para não receber mensagens e/ou notificações)
- 🟣 PUT /v1/spaces/:spaceId/topics/:topicId (Edita informações do tópico)
- 🟣 DELETE /v1/spaces/:spaceId/topics/:topicId (Deleta o tópico)

- 🟪 GET /v1/topics (Lista tópicos do space)
- 🟪 POST /v1/topics (Cria Tópico)

#### Gerencia mensagens de um tópico do Space

- 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings?limit&page (Página as mensagens de um tópico do Space)
- 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/:pingId/reads (Visualiza membros que visualizaram a mensagem)
- 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/:pingId/notified (Visualiza membros que foram notificados da mensagem)
- 🟣 GET /v1/spaces/:spaceId/topics/:topicId/pings/stream (Abre stream SSE pra receber mensagens)
- 🟣 PATCH /v1/spaces/:spaceId/topics/:topicId/pings/read (Visualiza Mensagens de um tópico)
- 🟣 POST /v1/spaces/:spaceId/topics/:topicId/webhook (Cria um webhook para escutar eventos do tópico)

- 🟪 GET /v1/topics/:topicSlug/pings?limit&page (Página as mensagens de um tópico do Space)
- 🟪 GET /v1/topics/:topicSlug/pings/sse (Abre stream SSE pra receber mensagens)
- 🟪 POST /v1/topics/:topicSlug/pings (Cria uma mensagem no tópico)

### Gerenciamento de membros do Space

- 🟣 GET /v1/spaces/:spaceId/members (Lista membros do space)
- 🟣 GET /v1/spaces/:spaceId/members/:memberId/details (Visualiza detalhes do membro)
- 🟣 POST /v1/spaces/:spaceId/members (Convida membro pro space)
- 🟣 PUT /v1/spaces/:spaceId/members/:memberId (Gerencia membro do space)
- 🟣 DELETE /v1/spaces/:spaceId/members/:memberId (Expulsa membro do space)

## Ações do usuário

- 🟣 GET /me/topics (Lista os tópicos em que o usuário está inscrito)
- 🟣 GET /me/spaces (Lista os spaces em que o usuário é membro)
- 🟣 PUT /me (Altera informações do usuário)
- 🟣 DELETE /me/delete (Deleta a conta)
