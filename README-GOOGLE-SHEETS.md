# Configuração do Google Sheets para o Formulário de Treinamento

Este documento contém instruções para configurar e usar a integração com o Google Sheets no projeto de Formulário de Treinamento.

## Arquivo de Credenciais

O arquivo `formulariotreinamento-091feb97eac3.json` contém as credenciais necessárias para acessar a API do Google Sheets. Este arquivo deve estar na raiz do projeto.

## Estrutura da Planilha

A integração espera uma planilha com as seguintes abas:

1. **Treinamentos** - Armazena os dados dos treinamentos agendados
   - Colunas: id, empresa, tipoTreinamento, participantes, telefones, emails, agendamento, dataCriacao, status

2. **Opcoes** - Armazena as opções selecionadas para cada treinamento
   - Colunas: treinamentoId, opcao, valor

3. **DatasBloqueadas** - Armazena as datas que não estão disponíveis para agendamento
   - Colunas: data, motivo

Se estas abas não existirem, o sistema tentará criá-las automaticamente na primeira execução.

## Variável de Ambiente

Certifique-se de que a variável de ambiente `GOOGLE_SHEET_ID` está configurada com o ID da sua planilha do Google Sheets. O ID é a parte da URL entre `/d/` e `/edit` quando você abre a planilha no navegador.

Exemplo: `https://docs.google.com/spreadsheets/d/SEU_ID_DA_PLANILHA_AQUI/edit`

## Permissões

Certifique-se de que a conta de serviço (`formsideia2001@formulariotreinamento.iam.gserviceaccount.com`) tem permissão de edição na planilha. Para isso:

1. Abra sua planilha no Google Sheets
2. Clique em "Compartilhar" no canto superior direito
3. Adicione o email da conta de serviço e dê permissão de "Editor"

## Modo de Fallback

O sistema inclui um modo de fallback que será ativado se:
- O arquivo de credenciais não for encontrado
- O ID da planilha não estiver definido
- Houver problemas de conexão com o Google Sheets

No modo de fallback, o sistema simulará o comportamento normal, mas não salvará ou recuperará dados reais da planilha.

## Solução de Problemas

Se encontrar erros relacionados ao Google Sheets:

1. Verifique se o arquivo de credenciais está na raiz do projeto
2. Confirme que a variável de ambiente `GOOGLE_SHEET_ID` está corretamente configurada
3. Verifique se a conta de serviço tem permissão de edição na planilha
4. Verifique se a planilha tem as abas necessárias com os cabeçalhos corretos
