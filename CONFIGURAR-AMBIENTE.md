# Configuração de Variáveis de Ambiente

Para que o sistema funcione corretamente, você precisa configurar a variável de ambiente `GOOGLE_SHEET_ID`.

## O que é o GOOGLE_SHEET_ID?

O `GOOGLE_SHEET_ID` é o identificador único da sua planilha no Google Sheets. Você pode encontrá-lo na URL da sua planilha:

\`\`\`
https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA_AQUI/edit
\`\`\`

A parte `SEU_ID_DA_PLANILHA_AQUI` é o ID que você precisa usar.

## Como configurar

### Em ambiente de desenvolvimento:

1. Crie um arquivo chamado `.env.local` na raiz do projeto
2. Adicione a seguinte linha ao arquivo:
   \`\`\`
   GOOGLE_SHEET_ID=seu_id_da_planilha_aqui
   \`\`\`
3. Reinicie o servidor de desenvolvimento

### Em ambiente de produção:

Se você estiver usando o Vercel:

1. Acesse o painel de controle do seu projeto no Vercel
2. Vá para "Settings" > "Environment Variables"
3. Adicione uma nova variável com o nome `GOOGLE_SHEET_ID` e o valor sendo o ID da sua planilha
4. Reimplante seu projeto para que as alterações tenham efeito

## Criando uma nova planilha

Se você ainda não tem uma planilha:

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Compartilhe a planilha com o email da conta de serviço: `formsideia2001@formulariotreinamento.iam.gserviceaccount.com`
4. Copie o ID da planilha da URL
5. Configure a variável de ambiente conforme as instruções acima

O sistema criará automaticamente as abas necessárias na primeira execução.
