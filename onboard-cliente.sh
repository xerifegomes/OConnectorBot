#!/bin/bash

# Script de Onboarding de Novo Cliente
# Cria e configura um novo cliente na plataforma oConnector

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Onboarding de Novo Cliente - oConnector Tech           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

API_URL="https://oconnector-api.xerifegomes-e71.workers.dev/api/clientes"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/train"

# Coletar dados do cliente
echo -e "${CYAN}📋 Dados do Cliente${NC}"
echo ""

read -p "Nome da Empresa/Imobiliária: " NOME_EMPRESA
read -p "WhatsApp (apenas números, ex: 22999999999): " WHATSAPP
read -p "Email: " EMAIL
read -p "Segmento (ex: imobiliária, salão, clínica): " SEGMENTO
read -p "Endereço completo: " ENDERECO
read -p "Horário de funcionamento: " HORARIO
read -p "Diferenciais da empresa: " DIFERENCIAIS

echo ""
echo -e "${CYAN}👥 Equipe${NC}"
read -p "Nome do responsável/gerente: " RESPONSAVEL
read -p "Especialidade: " ESPEC_RESPONSAVEL

CORRETORES_NOME=("$RESPONSAVEL")
CORRETORES_ESPEC=("$ESPEC_RESPONSAVEL")

echo ""
read -p "Adicionar mais membros da equipe? (s/n): " ADICIONAR_EQUIPE
while [ "$ADICIONAR_EQUIPE" = "s" ]; do
    read -p "Nome: " NOME_CORRETOR
    read -p "Especialidade: " ESPEC_CORRETOR
    CORRETORES_NOME+=("$NOME_CORRETOR")
    CORRETORES_ESPEC+=("$ESPEC_CORRETOR")
    read -p "Adicionar mais? (s/n): " ADICIONAR_EQUIPE
done

echo ""
echo -e "${CYAN}❓ FAQ - Perguntas Frequentes${NC}"
echo "Configure as perguntas e respostas mais comuns (pressione Enter vazio para finalizar):"
echo ""

FAQ_PERGUNTAS=()
FAQ_RESPOSTAS=()
counter=1

while true; do
    echo -e "${YELLOW}Pergunta $counter:${NC}"
    read -p "  Pergunta (ou Enter para finalizar): " PERGUNTA
    [ -z "$PERGUNTA" ] && break
    read -p "  Resposta: " RESPOSTA
    FAQ_PERGUNTAS+=("$PERGUNTA")
    FAQ_RESPOSTAS+=("$RESPOSTA")
    ((counter++))
    echo ""
done

# Converter arrays para JSON
PERGUNTAS_JSON="["
RESPOSTAS_JSON="["
for i in "${!FAQ_PERGUNTAS[@]}"; do
    if [ $i -gt 0 ]; then
        PERGUNTAS_JSON+=","
        RESPOSTAS_JSON+=","
    fi
    PERGUNTAS_JSON+="\"${FAQ_PERGUNTAS[$i]}\""
    RESPOSTAS_JSON+="\"${FAQ_RESPOSTAS[$i]}\""
done
PERGUNTAS_JSON+="]"
RESPOSTAS_JSON+="]"

# Construir JSON de corretores
CORRETORES_NOME_JSON="["
CORRETORES_ESPEC_JSON="["
for i in "${!CORRETORES_NOME[@]}"; do
    if [ $i -gt 0 ]; then
        CORRETORES_NOME_JSON+=","
        CORRETORES_ESPEC_JSON+=","
    fi
    CORRETORES_NOME_JSON+="\"${CORRETORES_NOME[$i]}\""
    CORRETORES_ESPEC_JSON+="\"${CORRETORES_ESPEC[$i]}\""
done
CORRETORES_NOME_JSON+="]"
CORRETORES_ESPEC_JSON+="]"

echo ""
echo -e "${CYAN}🎨 Personalização${NC}"
read -p "Tom de voz (amigavel/profissional/descontraido) [amigavel]: " TOM_VOZ
TOM_VOZ=${TOM_VOZ:-amigavel}
read -p "Usar emojis (nenhum/moderado/bastante) [moderado]: " EMOJIS
EMOJIS=${EMOJIS:-moderado}

echo ""
echo -e "${CYAN}💼 Plano${NC}"
read -p "Plano (STARTER/PROFESSIONAL/PREMIUM) [STARTER]: " PLANO
PLANO=${PLANO:-STARTER}
read -p "Valor mensal: " VALOR_MENSAL

echo ""
echo -e "${YELLOW}📊 Resumo do Cliente:${NC}"
echo "  Empresa: $NOME_EMPRESA"
echo "  WhatsApp: $WHATSAPP"
echo "  Segmento: $SEGMENTO"
echo "  Plano: $PLANO"
echo "  FAQ: ${#FAQ_PERGUNTAS[@]} perguntas configuradas"
echo ""

read -p "Confirmar criação? (s/n): " CONFIRMAR
if [ "$CONFIRMAR" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo -e "${YELLOW}🚀 Criando cliente...${NC}"

# Criar cliente via API
cliente_payload=$(cat <<EOF
{
  "nome_imobiliaria": "$NOME_EMPRESA",
  "whatsapp_numero": "$WHATSAPP",
  "plano": "$PLANO",
  "valor_mensal": $VALOR_MENSAL
}
EOF
)

cliente_response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$cliente_payload")

cliente_id=$(echo "$cliente_response" | jq -r '.data.id // .id // .cliente_id' 2>/dev/null || echo "")

if [ -z "$cliente_id" ] || [ "$cliente_id" = "null" ]; then
    # Tentar buscar cliente existente pelo WhatsApp
    echo -e "${YELLOW}⚠️  Cliente pode já existir. Buscando...${NC}"
    search_response=$(curl -s "$API_URL?whatsapp=$WHATSAPP")
    cliente_id=$(echo "$search_response" | jq -r '.data[0].id // .id // empty' 2>/dev/null || echo "")
    
    if [ -z "$cliente_id" ] || [ "$cliente_id" = "null" ]; then
        echo -e "${RED}❌ Erro ao criar cliente${NC}"
        echo "$cliente_response" | jq . 2>/dev/null || echo "$cliente_response"
        exit 1
    else
        echo -e "${GREEN}✅ Cliente encontrado (ID: $cliente_id)${NC}"
    fi
else
    echo -e "${GREEN}✅ Cliente criado (ID: $cliente_id)${NC}"
fi

echo ""
echo -e "${YELLOW}🤖 Treinando agente IA...${NC}"

# Treinar agente
training_payload=$(cat <<EOF
{
  "cliente_id": $cliente_id,
  "nome_empresa": "$NOME_EMPRESA",
  "whatsapp": "$WHATSAPP",
  "endereco": "$ENDERECO",
  "horario": "$HORARIO",
  "diferenciais": "$DIFERENCIAIS",
  "corretor_nome": $CORRETORES_NOME_JSON,
  "corretor_especialidade": $CORRETORES_ESPEC_JSON,
  "faq_pergunta": $PERGUNTAS_JSON,
  "faq_resposta": $RESPOSTAS_JSON,
  "tom_voz": "$TOM_VOZ",
  "usar_emojis": "$EMOJIS"
}
EOF
)

training_response=$(curl -s -X POST "$TRAINING_URL" \
  -H "Content-Type: application/json" \
  -d "$training_payload")

if echo "$training_response" | grep -q "\"success\":true"; then
    documentos=$(echo "$training_response" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Agente treinado com sucesso!${NC}"
    echo "  Documentos processados: $documentos"
else
    echo -e "${RED}❌ Erro ao treinar agente${NC}"
    echo "$training_response" | jq . 2>/dev/null || echo "$training_response"
    exit 1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  ✅ Onboarding Concluído!                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Cliente ID:${NC} $cliente_id"
echo -e "${GREEN}Empresa:${NC} $NOME_EMPRESA"
echo -e "${GREEN}WhatsApp:${NC} $WHATSAPP"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo "1. Verificar status: curl https://agent-training-worker.xerifegomes-e71.workers.dev/api/status/$cliente_id"
echo "2. Prospecção: ./prospectar-para-cliente.sh $cliente_id"
echo "3. Enviar mensagens: Via dashboard ou bot WhatsApp"
echo "4. Dashboard: https://oconnector.xerifegomes-e71.workers.dev/dashboard"
echo ""

