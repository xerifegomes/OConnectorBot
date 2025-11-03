"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { Loader2, Wifi, WifiOff, Bot, CheckCircle2, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: Date;
  contact: string;
}

interface Conversation {
  id: string;
  contact: string;
  contactName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
}

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"connected" | "disconnected" | "connecting" | "waiting_qr">("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [botInfo, setBotInfo] = useState<{ whatsappNumber?: string; name?: string } | null>(null);
  const [agentStatus, setAgentStatus] = useState<{ ready: boolean; trained: boolean } | null>(null);
  const [botServerConnected, setBotServerConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qrPollInterval = useRef<NodeJS.Timeout | null>(null);
  
  // URL do bot server local (pode ser configurado via env)
  const BOT_SERVER_URL = process.env.NEXT_PUBLIC_BOT_SERVER_URL || 'http://localhost:3001';

  useEffect(() => {
    loadConversations();
    checkBotStatus();
    checkBotServerConnection();
    checkAgentStatus();
    startQRPolling();
    
    return () => {
      if (qrPollInterval.current) {
        clearInterval(qrPollInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startQRPolling = () => {
    // Polling para verificar QR Code e status
    qrPollInterval.current = setInterval(async () => {
      await checkBotStatus();
      await checkBotServerConnection();
      if (status === "waiting_qr" && !qrCode) {
        await loadQRCode();
      }
    }, 3000); // A cada 3 segundos
  };

  const checkBotServerConnection = async () => {
    try {
      // Tentar conectar direto ao bot server local
      const response = await fetch(`${BOT_SERVER_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBotServerConnected(true);
        
        // Atualizar status do bot
        if (data.status) {
          setStatus(data.status as typeof status);
        }
        if (data.qr && data.status === 'waiting_qr') {
          setQrCode(data.qr);
          if (!showQRDialog) {
            setShowQRDialog(true);
          }
        }
        if (data.info) {
          setBotInfo(data.info);
        }
      } else {
        setBotServerConnected(false);
      }
    } catch (error) {
      setBotServerConnected(false);
      // Se falhar, tentar via API do Cloudflare
      await checkBotStatus();
    }
  };

  const checkAgentStatus = async () => {
    try {
      // Verificar status do agent IA via API
      const response = await api.getWhatsAppBotStatus();
      if (response.success && response.data) {
        const data = response.data as any;
        setAgentStatus({
          ready: data.ready || false,
          trained: data.info?.trained || false,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar status do agent:", error);
    }
  };

  const checkBotStatus = async () => {
    try {
      const response = await api.getWhatsAppStatus();
      if (response.success && response.data) {
        const statusData = response.data as any;
        const newStatus = statusData.status as "connected" | "disconnected" | "connecting" | "waiting_qr";
        setStatus(newStatus);
        
        // Se status mudou para waiting_qr, buscar QR Code
        if (newStatus === "waiting_qr" && !qrCode) {
          await loadQRCode();
        } else if (newStatus === "connected") {
          setQrCode(null);
          setShowQRDialog(false);
          // Carregar informações do bot
          await loadBotInfo();
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const loadQRCode = async () => {
    try {
      // Tentar primeiro do bot server local
      try {
        const botResponse = await fetch(`${BOT_SERVER_URL}/qr`);
        if (botResponse.ok) {
          const botData = await botResponse.json();
          if (botData.qr) {
            setQrCode(botData.qr);
            setShowQRDialog(true);
            return;
          }
        }
      } catch (e) {
        // Se falhar, tentar via API
      }
      
      // Fallback: via API do Cloudflare
      const response = await api.getWhatsAppQR();
      if (response.success && response.data?.qr) {
        setQrCode(response.data.qr);
        setShowQRDialog(true);
      }
    } catch (error) {
      console.error("Erro ao carregar QR Code:", error);
    }
  };

  const loadBotInfo = async () => {
    try {
      const response = await api.getWhatsAppBotStatus();
      if (response.success && response.data) {
        const data = response.data as any;
        setBotInfo(data.info || null);
      }
    } catch (error) {
      console.error("Erro ao carregar info do bot:", error);
    }
  };

  const handleConnect = async () => {
    setStatus("connecting");
    
    // Tentar reiniciar via bot server local primeiro
    try {
      const response = await fetch(`${BOT_SERVER_URL}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setTimeout(() => {
          checkBotServerConnection();
          loadQRCode();
        }, 2000);
        return;
      }
    } catch (e) {
      // Se falhar, tentar via API
    }
    
    // Fallback: via API do Cloudflare
    try {
      await api.restartWhatsAppBot();
      setTimeout(() => {
        checkBotStatus();
        loadQRCode();
      }, 2000);
    } catch (error) {
      console.error("Erro ao reiniciar bot:", error);
    }
    
    await loadQRCode();
    setShowQRDialog(true);
  };

  const handleRestart = async () => {
    setStatus("connecting");
    setQrCode(null);
    
    try {
      // Tentar via bot server local
      const response = await fetch(`${BOT_SERVER_URL}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setTimeout(() => {
          checkBotServerConnection();
          loadQRCode();
        }, 2000);
        return;
      }
    } catch (e) {
      // Fallback: via API
    }
    
    try {
      await api.restartWhatsAppBot();
      setTimeout(() => {
        checkBotStatus();
        loadQRCode();
      }, 2000);
    } catch (error) {
      console.error("Erro ao reiniciar bot:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.getWhatsAppConversations();
      if (response.success && response.data) {
        // Garantir que data é um array
        const conversationsData = Array.isArray(response.data) ? response.data : [];
        setConversations(conversationsData.map((conv: any) => ({
          id: conv.id || conv.contact,
          contact: conv.contact,
          contactName: conv.contactName,
          lastMessage: conv.lastMessage || 'Sem mensagens',
          lastMessageTime: new Date(conv.lastMessageTime),
          unread: conv.unread || 0,
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await api.getWhatsAppMessages(conversationId);
      if (response.success && response.data) {
        // Garantir que data é um array
        const messagesData = Array.isArray(response.data) ? response.data : [];
        setMessages(messagesData.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          fromMe: msg.fromMe,
          timestamp: new Date(msg.timestamp),
          contact: msg.contact || conversationId,
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      fromMe: true,
      timestamp: new Date(),
      contact: selectedConversation,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    try {
      const response = await api.sendWhatsAppMessage(selectedConversation, newMessage);
      
      if (response.success) {
        // Simular resposta do bot (em produção, bot responde automaticamente)
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "Mensagem recebida! Estou processando sua solicitação...",
            fromMe: false,
            timestamp: new Date(),
            contact: selectedConversation,
          };
          setMessages((prev) => [...prev, botResponse]);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WhatsApp Web</h1>
          <p className="text-sm text-muted-foreground">
            Interface de mensagens do oConnector
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Status do Bot Server */}
          <div className="flex items-center gap-2">
            {botServerConnected ? (
              <Badge variant="outline" className="gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                Bot Server
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <WifiOff className="h-3 w-3 text-red-500" />
                Bot Offline
              </Badge>
            )}
          </div>
          
          {/* Status do Agent IA */}
          {agentStatus && (
            <div className="flex items-center gap-2">
              <Badge variant={agentStatus.ready ? "default" : "secondary"} className="gap-1">
                <Bot className="h-3 w-3" />
                Agent {agentStatus.ready ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          )}
          
          {status === "disconnected" && (
            <Button onClick={handleConnect} size="sm">
              Conectar WhatsApp
            </Button>
          )}
          {status === "connected" && (
            <Button onClick={handleRestart} variant="outline" size="sm">
              Reconectar
            </Button>
          )}
          {status === "waiting_qr" && (
            <Button onClick={handleConnect} variant="outline" size="sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerar QR Code
            </Button>
          )}
          <Badge variant={status === "connected" ? "default" : "secondary"}>
            {status === "connected" && (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectado
              </>
            )}
            {status === "waiting_qr" && (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Aguardando QR
              </>
            )}
            {status === "connecting" && (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Conectando...
              </>
            )}
            {status === "disconnected" && (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
          {botInfo?.whatsappNumber && (
            <span className="text-sm text-muted-foreground">
              {botInfo.whatsappNumber}
            </span>
          )}
        </div>
      </div>

      {/* Dialog QR Code */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com o WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg flex justify-center border-2 border-primary">
                  <QRCodeSVG value={qrCode} size={256} level="H" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Como conectar:
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 text-left max-w-md">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em <strong>Menu</strong> (três pontos) ou <strong>Configurações</strong></li>
                    <li>3. Vá em <strong>Aparelhos conectados</strong></li>
                    <li>4. Toque em <strong>Conectar um aparelho</strong></li>
                    <li>5. Escaneie este QR Code</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button onClick={checkBotStatus} variant="outline" size="sm">
                    <Loader2 className="h-4 w-4 mr-2" />
                    Verificar Status
                  </Button>
                  <Button onClick={loadQRCode} variant="outline" size="sm">
                    Atualizar QR Code
                  </Button>
                </div>
                {!botServerConnected && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Bot server não está rodando. Inicie o servidor em: <code className="bg-background px-1 rounded">whatsapp-bot</code>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Gerando QR Code...
                </p>
                {!botServerConnected && (
                  <p className="text-sm text-destructive mt-2">
                    Conecte-se ao bot server primeiro
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversas */}
        <div className="w-80 bg-card border-r flex flex-col">
          <div className="p-4 border-b">
            <Input placeholder="Buscar conversas..." className="w-full bg-background" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    selectedConversation === conv.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{conv.contactName}</h3>
                    {conv.unread > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conv.lastMessageTime.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main - Mensagens */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header da conversa */}
              <div className="bg-card border-b px-6 py-4">
                <h2 className="font-semibold text-foreground">
                  {
                    conversations.find((c) => c.id === selectedConversation)
                      ?.contactName
                  }
                </h2>
                <p className="text-sm text-muted-foreground">
                  {
                    conversations.find((c) => c.id === selectedConversation)
                      ?.contact
                  }
                </p>
              </div>

              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
                {loading ? (
                  <div className="text-center text-muted-foreground">
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Nenhuma mensagem ainda. Comece a conversa!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.fromMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.fromMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border text-card-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.fromMe
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="bg-card border-t px-6 py-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-background"
                    disabled={status !== "connected"}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || status !== "connected"}
                  >
                    {status === "connected" ? "Enviar" : "Aguardando conexão"}
                  </Button>
                </div>
                {status !== "connected" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Conecte o WhatsApp para enviar mensagens
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center max-w-md px-4">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  {status === "connected" 
                    ? "Selecione uma conversa"
                    : "Conecte o WhatsApp primeiro"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {status === "connected"
                    ? "Escolha uma conversa da lista para começar a conversar"
                    : status === "waiting_qr"
                    ? "Escaneie o QR Code para conectar"
                    : "Clique em 'Conectar WhatsApp' para gerar o QR Code e começar"}
                </p>
                {status === "disconnected" && (
                  <div className="space-y-3">
                    <Button onClick={handleConnect} size="lg">
                      Conectar WhatsApp
                    </Button>
                    {!botServerConnected && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Bot server não está rodando. Inicie com: <code className="bg-background px-1 rounded">cd whatsapp-bot && npm run server</code>
                      </div>
                    )}
                  </div>
                )}
                {status === "waiting_qr" && !showQRDialog && (
                  <Button onClick={() => setShowQRDialog(true)} variant="outline">
                    Ver QR Code
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
