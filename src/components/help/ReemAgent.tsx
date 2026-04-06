'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText, ChevronDown, HelpCircle, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { findHelpTopicByPrompt, getPageHelpContext } from '@/lib/help/content';

interface ReemMessage {
  id: string;
  role: 'user' | 'reem';
  content: string;
  suggestions?: string[];
}

function buildReemReply(input: string, pathname: string) {
  const topic = findHelpTopicByPrompt(input, pathname);
  const pageContext = getPageHelpContext(pathname);

  if (!topic) {
    return {
      content: `I can help with product guidance for ${pageContext.page}. Try one of these questions, or open the full Help Center for the complete documentation.`,
      suggestions: [...pageContext.quickHelp, 'Open the Help Center'],
    };
  }

  const summary = topic.content.slice(0, 2).join(' ');
  const related = topic.keywords.slice(0, 3).map((keyword) => {
    if (keyword.length === 0) return keyword;
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
  });

  return {
    content: summary,
    suggestions: ['Open the Help Center', ...related].slice(0, 4),
  };
}

export function ReemAgent() {
  const pathname = usePathname() ?? '/dashboard';
  const locale = useAppStore((state) => state.locale);
  const isArabic = locale === 'ar';
  const pageContext = useMemo(() => getPageHelpContext(pathname), [pathname]);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ReemMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setMessages([
      {
        id: 'welcome',
        role: 'reem',
        content: isArabic
          ? `أنا ريم، مرشدة Wealix داخل التطبيق. أنت الآن في ${pageContext.page}. كيف أساعدك؟`
          : `I’m Reem, your in-app Wealix guide. You are currently on ${pageContext.page}. What would you like help with?`,
        suggestions: pageContext.quickHelp,
      },
    ]);
  }, [isArabic, isOpen, pageContext.page, pageContext.quickHelp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (value: string) => {
    const message = value.trim();
    if (!message || isTyping) return;

    const userMessage: ReemMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => window.setTimeout(resolve, 350));

    const reply = buildReemReply(message, pathname);

    setMessages((current) => [
      ...current,
      {
        id: `reem-${Date.now()}`,
        role: 'reem',
        content: reply.content,
        suggestions: reply.suggestions,
      },
    ]);

    setIsTyping(false);
  };

  const handleSuggestion = (suggestion: string) => {
    if (suggestion === 'Open the Help Center') {
      setIsOpen(false);
      setMessages([]);
      return;
    }

    void sendMessage(suggestion);
  };

  return (
    <>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-auto rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-4 py-3 text-white shadow-xl shadow-teal-900/15 hover:opacity-95"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            {isArabic ? 'اسأل ريم' : 'Ask Reem'}
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-4 z-50 flex w-[min(92vw,26rem)] flex-col overflow-hidden rounded-[1.6rem] border border-border bg-background shadow-2xl md:bottom-6 md:right-6"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Reem</p>
                  <p className="text-xs text-white/80">
                    {isArabic ? 'دليل المساعدة داخل Wealix' : 'Wealix help guide'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setIsMinimized((current) => !current)}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isMinimized && 'rotate-180')} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl text-white hover:bg-white/15 hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                    setIsMinimized(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized ? (
              <>
                <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                  {pageContext.greeting}
                </div>

                <div className="max-h-[24rem] space-y-4 overflow-y-auto px-4 py-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6',
                            message.role === 'user'
                              ? 'rounded-tr-sm bg-primary text-primary-foreground'
                              : 'rounded-tl-sm bg-muted text-foreground'
                          )}
                        >
                          {message.content}
                        </div>
                      </div>

                      {message.role === 'reem' && message.suggestions?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion) =>
                            suggestion === 'Open the Help Center' ? (
                              <Button key={suggestion} asChild size="sm" variant="outline" className="rounded-full">
                                <Link href="/help" onClick={() => setIsOpen(false)}>
                                  <BookOpenText className="mr-1.5 h-3.5 w-3.5" />
                                  {isArabic ? 'مركز المساعدة' : 'Help Center'}
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                key={suggestion}
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => handleSuggestion(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {isTyping ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
                        {isArabic ? 'ريم تكتب...' : 'Reem is typing...'}
                      </div>
                    </div>
                  ) : null}

                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border px-3 py-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void sendMessage(input);
                        }
                      }}
                      placeholder={isArabic ? 'اسأل عن أي ميزة داخل Wealix' : 'Ask about any Wealix feature'}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-xl"
                      disabled={isTyping || input.trim().length === 0}
                      onClick={() => void sendMessage(input)}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
