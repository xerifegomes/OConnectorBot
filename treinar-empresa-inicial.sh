#!/bin/bash

# Script de Treinamento da Empresa Inicial (oConnector Tech)
# Treina o agente com todas as informações sobre a empresa

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Treinamento da Empresa Inicial - oConnector Tech       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

CLIENTE_ID="${1:-1}"
TRAINING_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/train"

echo -e "${CYAN}📋 Coletando informações da empresa...${NC}"
echo ""

# Informações da Empresa
read -p "Nome da Empresa [oConnector Tech]: " NOME_EMPRESA
NOME_EMPRESA=${NOME_EMPRESA:-oConnector Tech}

read -p "WhatsApp (apenas números): " WHATSAPP
if [ -z "$WHATSAPP" ]; then
    echo -e "${RED}❌ WhatsApp é obrigatório${NC}"
    exit 1
fi

read -p "Email: " EMAIL

read -p "Endereço completo: " ENDERECO

read -p "Horário de funcionamento: " HORARIO
HORARIO=${HORARIO:-Seg-Sex: 9h-18h}

echo ""
echo -e "${CYAN}💼 Sobre a Empresa${NC}"
echo ""

read -p "Missão/Propósito da empresa: " MISSAO

read -p "Diferenciais principais (separados por vírgula): " DIFERENCIAIS

read -p "Anos de experiência no mercado: " EXPERIENCIA

read -p "Principais serviços/soluções oferecidas: " SERVICOS

read -p "Tecnologias utilizadas: " TECNOLOGIAS

read -p "Principais segmentos de clientes: " SEGMENTOS

read -p "Cases de sucesso ou resultados alcançados: " CASES

echo ""
echo -e "${CYAN}👥 Equipe${NC}"
echo ""

read -p "Nome do fundador/responsável: " RESPONSAVEL
read -p "Especialidade/Formação: " ESPEC_RESPONSAVEL

CORRETORES_NOME=("$RESPONSAVEL")
CORRETORES_ESPEC=("$ESPEC_RESPONSAVEL")

read -p "Adicionar mais membros da equipe? (s/n): " ADICIONAR_EQUIPE
while [ "$ADICIONAR_EQUIPE" = "s" ]; do
    read -p "Nome: " NOME_MEMBRO
    read -p "Especialidade: " ESPEC_MEMBRO
    CORRETORES_NOME+=("$NOME_MEMBRO")
    CORRETORES_ESPEC+=("$ESPEC_MEMBRO")
    read -p "Adicionar mais? (s/n): " ADICIONAR_EQUIPE
done

echo ""
echo -e "${CYAN}💼 Produtos/Serviços Detalhados${NC}"
echo ""

read -p "Descreva o produto principal (oConnector): " PRODUTO_PRINCIPAL

read -p "Funcionalidades principais: " FUNCIONALIDADES

read -p "Benefícios para o cliente: " BENEFICIOS

read -p "Como funciona o processo (da prospecção à venda): " PROCESSO

read -p "Preços e planos: " PRECOS

echo ""
echo -e "${CYAN}❓ FAQ - Perguntas Frequentes${NC}"
echo "Configure perguntas e respostas comuns (pressione Enter vazio para finalizar):"
echo ""

FAQ_PERGUNTAS=()
FAQ_RESPOSTAS=()
counter=1

# Perguntas padrão sobre o produto
echo -e "${YELLOW}Perguntas padrão sobre o produto:${NC}"

perguntas_padrao=(
    "O que é o oConnector?"
    "Como funciona a plataforma?"
    "Quanto custa?"
    "Quanto tempo leva para configurar?"
    "Preciso de conhecimento técnico?"
    "Quais tipos de negócios podem usar?"
    "Como funciona o agente IA?"
    "A plataforma funciona 24/7?"
    "Como funciona a prospecção automatizada?"
    "Como são geradas as mensagens personalizadas?"
)

for pergunta in "${perguntas_padrao[@]}"; do
    echo -e "${GREEN}$pergunta${NC}"
    read -p "  Resposta: " RESPOSTA
    if [ ! -z "$RESPOSTA" ]; then
        FAQ_PERGUNTAS+=("$pergunta")
        FAQ_RESPOSTAS+=("$RESPOSTA")
    fi
    echo ""
done

echo "Adicione mais perguntas personalizadas (Enter vazio para finalizar):"
while true; do
    read -p "Pergunta: " PERGUNTA
    [ -z "$PERGUNTA" ] && break
    read -p "Resposta: " RESPOSTA
    FAQ_PERGUNTAS+=("$PERGUNTA")
    FAQ_RESPOSTAS+=("$RESPOSTA")
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
read -p "Tom de voz (amigavel/profissional/descontraido) [profissional]: " TOM_VOZ
TOM_VOZ=${TOM_VOZ:-profissional}
read -p "Usar emojis (nenhum/moderado/bastante) [moderado]: " EMOJIS
EMOJIS=${EMOJIS:-moderado}

echo ""
echo -e "${YELLOW}📊 Resumo das Informações:${NC}"
echo "  Empresa: $NOME_EMPRESA"
echo "  WhatsApp: $WHATSAPP"
echo "  FAQ: ${#FAQ_PERGUNTAS[@]} perguntas configuradas"
echo "  Equipe: ${#CORRETORES_NOME[@]} membros"
echo ""

read -p "Confirmar treinamento? (s/n): " CONFIRMAR
if [ "$CONFIRMAR" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo -e "${YELLOW}🤖 Treinando agente com todas as informações...${NC}"
echo ""

# Construir descrição completa da empresa
DESCRICAO_COMPLETA="A $NOME_EMPRESA é uma empresa de tecnologia especializada em soluções de automação para negócios locais. "

if [ ! -z "$MISSAO" ]; then
    DESCRICAO_COMPLETA+="Nossa missão: $MISSAO. "
fi

if [ ! -z "$EXPERIENCIA" ]; then
    DESCRICAO_COMPLETA+="Com $EXPERIENCIA anos de experiência no mercado. "
fi

if [ ! -z "$DIFERENCIAIS" ]; then
    DESCRICAO_COMPLETA+="Diferenciais: $DIFERENCIAIS. "
fi

if [ ! -z "$SERVICOS" ]; then
    DESCRICAO_COMPLETA+="Oferecemos: $SERVICOS. "
fi

if [ ! -z "$TECNOLOGIAS" ]; then
    DESCRICAO_COMPLETA+="Utilizamos as seguintes tecnologias: $TECNOLOGIAS. "
fi

if [ ! -z "$SEGMENTOS" ]; then
    DESCRICAO_COMPLETA+="Atendemos principalmente: $SEGMENTOS. "
fi

if [ ! -z "$CASES" ]; then
    DESCRICAO_COMPLETA+="Resultados alcançados: $CASES. "
fi

# Adicionar informações sobre o produto
if [ ! -z "$PRODUTO_PRINCIPAL" ]; then
    DESCRICAO_COMPLETA+="Nossos produtos: $PRODUTO_PRINCIPAL. "
fi

if [ ! -z "$FUNCIONALIDADES" ]; then
    DESCRICAO_COMPLETA+="Funcionalidades: $FUNCIONALIDADES. "
fi

if [ ! -z "$BENEFICIOS" ]; then
    DESCRICAO_COMPLETA+="Benefícios para clientes: $BENEFICIOS. "
fi

if [ ! -z "$PROCESSO" ]; then
    DESCRICAO_COMPLETA+="Como funciona: $PROCESSO. "
fi

if [ ! -z "$PRECOS" ]; then
    DESCRICAO_COMPLETA+="Planos e preços: $PRECOS. "
fi

# Criar payload completo
training_payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "nome_empresa": "$NOME_EMPRESA",
  "whatsapp": "$WHATSAPP",
  "endereco": "$ENDERECO",
  "horario": "$HORARIO",
  "diferenciais": "$DESCRICAO_COMPLETA",
  "corretor_nome": $CORRETORES_NOME_JSON,
  "corretor_especialidade": $CORRETORES_ESPEC_JSON,
  "faq_pergunta": $PERGUNTAS_JSON,
  "faq_resposta": $RESPOSTAS_JSON,
  "tom_voz": "$TOM_VOZ",
  "usar_emojis": "$EMOJIS"
}
EOF
)

# Fazer requisição
response=$(curl -s -w "\n%{http_code}" -X POST "$TRAINING_URL" \
  -H "Content-Type: application/json" \
  -d "$training_payload")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Mostrar resposta
echo -e "${GREEN}Resposta:${NC}"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""

# Verificar sucesso
if [ "$http_code" -eq 200 ] && echo "$body" | grep -q "\"success\":true"; then
    documentos=$(echo "$body" | jq -r '.documentos_processados // 0' 2>/dev/null || echo "0")
    metodo=$(echo "$body" | jq -r '.metodo // "N/A"' 2>/dev/null || echo "N/A")
    
    echo -e "${GREEN}✅ Agente treinado com sucesso!${NC}"
    echo ""
    echo -e "${GREEN}Documentos processados:${NC} $documentos"
    echo -e "${GREEN}Método usado:${NC} $metodo"
    echo ""
    
    # Testar o agente
    echo -e "${CYAN}🧪 Testando o agente...${NC}"
    echo ""
    
    # Testar algumas perguntas
    TEST_QUERIES=(
        "O que é o oConnector?"
        "Como funciona a plataforma?"
        "Quanto custa?"
        "Quais são os diferenciais da empresa?"
    )
    
    QUERY_URL="https://agent-training-worker.xerifegomes-e71.workers.dev/api/query"
    
    for query in "${TEST_QUERIES[@]}"; do
        echo -e "${YELLOW}Pergunta:${NC} $query"
        
        query_payload=$(cat <<EOF
{
  "cliente_id": $CLIENTE_ID,
  "pergunta": "$query"
}
EOF
)
        
        query_response=$(curl -s -X POST "$QUERY_URL" \
          -H "Content-Type: application/json" \
          -d "$query_payload")
        
        resposta=$(echo "$query_response" | jq -r '.resposta // .error' 2>/dev/null || echo "Erro")
        
        if [ ! -z "$resposta" ] && [ "$resposta" != "null" ] && [ "$resposta" != "Erro" ]; then
            echo -e "${GREEN}Resposta:${NC} ${resposta:0:150}..."
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌ Erro ao obter resposta${NC}"
        fi
        echo ""
    done
    
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║            ✅ Treinamento Concluído com Sucesso!          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Próximos passos:${NC}"
    echo "1. Testar mais: ./testar-agente.sh $CLIENTE_ID"
    echo "2. Iniciar bot WhatsApp: cd whatsapp-bot && npm start"
    echo "3. Começar a prospectar: ./prospectar-leads.sh"
    echo ""
else
    echo -e "${RED}❌ Erro ao treinar agente${NC}"
    echo -e "${RED}HTTP Code: $http_code${NC}"
    exit 1
fi

