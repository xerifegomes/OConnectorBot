#!/bin/bash

# Script de Configuração da Empresa
# Configura os dados da sua empresa para treinar o agente IA

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Configuração da Empresa - oConnector                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Criar arquivo de configuração se não existir
CONFIG_FILE="config-empresa.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}📝 Criando arquivo de configuração...${NC}"
    echo ""
    
    # Solicitar dados da empresa
    echo -e "${GREEN}Por favor, preencha as informações da sua empresa:${NC}"
    echo ""
    
    read -p "Nome da Empresa: " NOME_EMPRESA
    read -p "WhatsApp (apenas números, ex: 22999999999): " WHATSAPP
    read -p "Endereço completo: " ENDERECO
    read -p "Horário de funcionamento: " HORARIO
    read -p "Diferenciais da empresa: " DIFERENCIAIS
    
    echo ""
    echo -e "${YELLOW}Equipe (pressione Enter para pular):${NC}"
    read -p "Nome do colaborador 1: " CORRETOR1
    read -p "Especialidade: " ESPEC1
    read -p "Nome do colaborador 2 (Enter para pular): " CORRETOR2
    read -p "Especialidade: " ESPEC2
    
    echo ""
    echo -e "${YELLOW}FAQ - Perguntas Frequentes:${NC}"
    echo "Digite as perguntas e respostas (pressione Enter vazio para finalizar):"
    
    FAQ_PERGUNTAS=()
    FAQ_RESPOSTAS=()
    
    while true; do
        read -p "Pergunta (ou Enter para finalizar): " PERGUNTA
        [ -z "$PERGUNTA" ] && break
        read -p "Resposta: " RESPOSTA
        FAQ_PERGUNTAS+=("$PERGUNTA")
        FAQ_RESPOSTAS+=("$RESPOSTA")
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
    CORRETORES_NOME="["
    CORRETORES_ESPEC="["
    if [ ! -z "$CORRETOR1" ]; then
        CORRETORES_NOME+="\"$CORRETOR1\""
        CORRETORES_ESPEC+="\"$ESPEC1\""
        if [ ! -z "$CORRETOR2" ]; then
            CORRETORES_NOME+=",\"$CORRETOR2\""
            CORRETORES_ESPEC+=",\"$ESPEC2\""
        fi
    fi
    CORRETORES_NOME+="]"
    CORRETORES_ESPEC+="]"
    
    # Criar arquivo JSON
    cat > "$CONFIG_FILE" <<EOF
{
  "cliente_id": 1,
  "nome_empresa": "$NOME_EMPRESA",
  "whatsapp": "$WHATSAPP",
  "endereco": "$ENDERECO",
  "horario": "$HORARIO",
  "diferenciais": "$DIFERENCIAIS",
  "corretor_nome": $CORRETORES_NOME,
  "corretor_especialidade": $CORRETORES_ESPEC,
  "faq_pergunta": $PERGUNTAS_JSON,
  "faq_resposta": $RESPOSTAS_JSON,
  "tom_voz": "amigavel",
  "usar_emojis": "moderado"
}
EOF
    
    echo ""
    echo -e "${GREEN}✅ Configuração salva em $CONFIG_FILE${NC}"
else
    echo -e "${GREEN}✅ Arquivo de configuração encontrado: $CONFIG_FILE${NC}"
    echo ""
    echo "Conteúdo atual:"
    cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
    echo ""
    read -p "Deseja editar? (s/n): " EDITAR
    if [ "$EDITAR" = "s" ]; then
        # Editar manualmente ou recriar
        read -p "Deseja recriar do zero? (s/n): " RECRIAR
        if [ "$RECRIAR" = "s" ]; then
            rm "$CONFIG_FILE"
            exec "$0"  # Reiniciar script
        fi
    fi
fi

echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. Execute: ./treinar-agente.sh"
echo "2. Execute: ./prospectar-leads.sh"

