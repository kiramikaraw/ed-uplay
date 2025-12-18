import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorProps {
  subject?: string;
  educationLevel?: string;
}

export function AITutor({ subject, educationLevel }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hai! 👋 Aku Foxy, teman belajarmu! Ada yang bisa aku bantu hari ini? Tanya apa saja tentang pelajaranmu ya! 🎓✨'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          subject,
          educationLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message to update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('AI Tutor error:', error);
      toast({
        title: 'Oops!',
        description: error instanceof Error ? error.message : 'Gagal menghubungi Foxy',
        variant: 'destructive',
      });
      // Remove the empty assistant message if error
      if (!assistantContent) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
      >
        <div className="text-3xl group-hover:animate-bounce">🦊</div>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 bg-card border border-border rounded-2xl shadow-2xl transition-all ${
        isMinimized 
          ? 'bottom-6 right-6 w-72 h-14' 
          : 'bottom-6 right-6 w-96 h-[500px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
            🦊
          </div>
          <div>
            <h3 className="font-bold text-sm">Foxy AI Tutor</h3>
            <p className="text-xs text-muted-foreground">Siap membantu belajar!</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[340px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary/20' 
                      : 'bg-gradient-to-br from-primary to-secondary'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary" />
                    ) : (
                      <span className="text-sm">🦊</span>
                    )}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm">🦊</span>
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Tanya Foxy apa saja..."
                className="min-h-[44px] max-h-24 resize-none"
                disabled={isLoading}
              />
              <GameButton
                variant="primary"
                size="sm"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </GameButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
