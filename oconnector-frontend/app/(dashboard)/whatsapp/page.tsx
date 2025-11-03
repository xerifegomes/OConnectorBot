"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qrPollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConversations();
    checkBotStatus();
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
    }, 3000); // A cada 3 segundos
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
    await loadQRCode();
    setShowQRDialog(true);
  };

  const handleRestart = async () => {
    try {
      await api.restartWhatsAppBot();
      setStatus("connecting");
      setQrCode(null);
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
        setConversations(response.data.map((conv: any) => ({
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
        setMessages(response.data.map((msg: any) => ({
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Web</h1>
          <p className="text-sm text-muted-foreground">
            Interface de mensagens do oConnector
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <Badge variant={status === "connected" ? "default" : "secondary"}>
            {status === "connected" && "✅ Conectado"}
            {status === "waiting_qr" && "⏳ Aguardando QR Code"}
            {status === "connecting" && "🔄 Conectando..."}
            {status === "disconnected" && "❌ Desconectado"}
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
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  1. Abra o WhatsApp no celular<br />
                  2. Vá em Menu → Aparelhos conectados<br />
                  3. Toque em Conectar um aparelho<br />
                  4. Escaneie este QR Code
                </p>
                <Button onClick={checkBotStatus} variant="outline" size="sm">
                  Verificar Status
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Gerando QR Code...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversas */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <Input placeholder="Buscar conversas..." className="w-full" />
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
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.id ? "bg-gray-100" : ""
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
              <div className="bg-white border-b px-6 py-4">
                <h2 className="font-semibold">
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
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
                            : "bg-white border"
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
              <div className="bg-white border-t px-6 py-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma mensagem..."
                    className="flex-1"
                    disabled={status !== "connected"}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || status !== "connected"}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-semibold mb-2">
                  {status === "connected" 
                    ? "Selecione uma conversa"
                    : "Conecte o WhatsApp primeiro"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {status === "connected"
                    ? "Escolha uma conversa da lista para começar"
                    : "Clique em 'Conectar WhatsApp' para começar"}
                </p>
                {status === "disconnected" && (
                  <Button onClick={handleConnect}>
                    Conectar WhatsApp
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
