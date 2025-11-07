import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Messages() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<{
    partnerId: number;
    listingId: number;
  } | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations, isLoading: conversationsLoading } = trpc.messages.conversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: messages, isLoading: messagesLoading } = trpc.messages.getConversation.useQuery(
    {
      partnerId: selectedConversation?.partnerId || 0,
      listingId: selectedConversation?.listingId || 0,
    },
    { enabled: !!selectedConversation }
  );

  const utils = trpc.useUtils();
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      utils.messages.getConversation.invalidate();
      utils.messages.conversations.invalidate();
    },
    onError: () => {
      toast.error("Mesaj gönderilirken hata oluştu");
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMutation.mutate({
      receiverId: selectedConversation.partnerId,
      listingId: selectedConversation.listingId,
      content: messageText,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Giriş Yapın</h2>
            <p className="text-gray-600 mb-6">
              Mesajlarınızı görmek için giriş yapmanız gerekmektedir.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">Giriş Yap</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              Ana Sayfaya Dön
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Mesajlar</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                {conversationsLoading ? (
                  <div className="p-8 text-center text-gray-600">Yükleniyor...</div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y">
                    {conversations.map((conv: any) => (
                      <button
                        key={`${conv.partnerId}-${conv.listingId}`}
                        onClick={() =>
                          setSelectedConversation({
                            partnerId: conv.partnerId,
                            listingId: conv.listingId,
                          })
                        }
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedConversation?.partnerId === conv.partnerId &&
                          selectedConversation?.listingId === conv.listingId
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold">Kullanıcı #{conv.partnerId}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.lastMessageAt).toLocaleDateString('tr-TR')}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz mesajınız yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b p-4">
                    <h3 className="font-semibold">Kullanıcı #{selectedConversation.partnerId}</h3>
                    <p className="text-sm text-gray-600">İlan #{selectedConversation.listingId}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-600">Yükleniyor...</div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.senderId === user?.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-600">Henüz mesaj yok</div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Mesajınızı yazın..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        disabled={sendMutation.isPending}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!messageText.trim() || sendMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Bir konuşma seçin</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
