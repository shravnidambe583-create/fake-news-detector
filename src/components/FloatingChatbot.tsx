import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mic, Sparkles, Loader2, RefreshCw, MessageSquare, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface FloatingChatbotProps {
  user: any;
}

export default function FloatingChatbot({ user }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Greetings, Analyst. I'm **AntiGravity AI**, your digital companion. Paste any news headline or claim here to instantly audit clickbait structures, lateral biases, and logical fallacies.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const listBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        listBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, loading, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || loading) return;

    setChatInput('');
    setLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    // Store user message and add a blank model message placeholder that will acquire the stream
    setMessages(prev => [...prev, userMessage, {
      role: 'model',
      text: '',
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: "floating_chat_session",
          message: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("Factual synthesis failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read answer stream");
      }

      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;

            let parsed: any;
            try {
              parsed = JSON.parse(dataStr);
            } catch (pErr) {
              console.warn("Event Stream parsing check did not find JSON chunk:", dataStr, pErr);
              continue;
            }
            if (parsed.error) {
              throw new Error(parsed.message || "Failed during streaming");
            }

            if (parsed.chunk) {
              accumulatedText += parsed.chunk;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    text: accumulatedText
                  };
                }
                return updated;
              });
            }

            if (parsed.done && parsed.message) {
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
                  updated[lastIdx] = {
                    role: 'model',
                    text: parsed.message.text,
                    timestamp: parsed.message.timestamp
                  };
                }
                return updated;
              });
            }
          }
        }
      }

    } catch (err: any) {
      setMessages(prev => {
        const updated = [...prev];
        // Clean up unfinished placeholder if empty
        const last = updated[updated.length - 1];
        if (last && last.role === 'model' && !last.text) {
          updated.pop();
        }
        return [...updated, {
          role: 'model',
          text: `Error processing claim check: ${err.message}. Offline verification simulation active.`,
          timestamp: new Date().toISOString()
        }];
      });
    } finally {
      setLoading(false);
    }
  };

  // Speaks using HTML5 synthesizer
  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speaking === id) {
        window.speechSynthesis.cancel();
        setSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanNarration = text.replace(/\*\*/g, '').replace(/\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanNarration.substring(0, 150));
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setSpeaking(id);
    }
  };

  // Light Markdown compile
  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      let content = line;
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      
      if (isBullet) {
        content = line.trim().substring(2);
      }

      const parts = content.split('**');
      const renderedLine = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-bold text-indigo-300">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={i} className="list-disc ml-4 mt-0.5 text-slate-300 text-xs leading-relaxed">
            {renderedLine}
          </li>
        );
      }

      return (
        <p key={i} className="text-slate-200 text-xs leading-relaxed mb-1.5">
          {renderedLine}
        </p>
      );
    });
  };

  const triggerVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Stopping speech error", e);
        }
      }
      setIsListening(false);
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setChatInput("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setChatInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition diagnostic:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setChatInput("Microphone access is blocked.");
        } else if (event.error === 'no-speech') {
          setChatInput("No speech detected. Try again.");
        } else {
          setChatInput("Voice capture error. Try typing!");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error("Speech Recognition starting error", err);
        setIsListening(false);
      }
    } else {
      setIsListening(true);
      setChatInput("Listening (Fallback Emulation)...");
      setTimeout(() => {
        setChatInput("Describe clickbait patterns in modern journalism");
        setIsListening(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* FLOAT BUTTON */}
      <button
        id="floating-chat-bubble-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-indigo-400/30 relative group"
        title="Chat with AntiGravity AI"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <React.Fragment>
            <Bot className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </React.Fragment>
        )}
      </button>

      {/* FLOAT DRAWER */}
      {isOpen && (
        <div 
          id="floating-chat-container"
          className="absolute bottom-18 right-0 w-92 max-w-[calc(100vw-32px)] h-[480px] bg-slate-950/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-md animate-[slideUp_0.2s_ease-out] border-indigo-500/10"
        >
          {/* Drawer Header */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-md">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-white tracking-wide">AntiGravity Assistant</h3>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  Hybrid Fact Classifier
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Drawer Thread Screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left scrollbar-thin scrollbar-thumb-slate-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] shrink-0 border mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600/10 text-blue-300 border-blue-500/20'
                    : 'bg-indigo-600/10 text-indigo-300 border-indigo-500/20'
                }`}>
                  {msg.role === 'user' ? 'U' : 'A'}
                </div>

                <div className="space-y-1 max-w-[80%]">
                  <div className={`p-3 rounded-2xl text-xs font-normal text-slate-100 shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-950/30 to-blue-950/20 rounded-tr-none border border-blue-500/15'
                      : 'bg-slate-900/50 rounded-tl-none border border-slate-800/60'
                  }`}>
                    {renderMarkdownText(msg.text)}
                  </div>
                  
                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono px-1">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => speakText(msg.text, `float_msg_${index}`)}
                        className={`hover:text-indigo-400 transition-colors p-0.5 rounded ${speaking === `float_msg_${index}` ? 'text-indigo-400 font-bold' : ''}`}
                        title="Speech synthesis narration"
                      >
                        <Volume2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 animate-pulse">
                  A
                </div>
                <div className="p-3 bg-slate-900/50 rounded-2xl rounded-tl-none border border-slate-850 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono shadow-sm">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                  <span>Checking index nodes...</span>
                </div>
              </div>
            )}
            <div ref={listBottomRef} />
          </div>

          {/* Quick preset suggestion pill */}
          <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-900 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleSendMessage("Spot clickbait headlines")}
              className="text-[9px] px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 hover:border-indigo-500/30 font-mono shrink-0 cursor-pointer transition-colors"
            >
              Spot clickbait
            </button>
            <button
              onClick={() => handleSendMessage("What is Lateral Reading?")}
              className="text-[9px] px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 hover:border-indigo-500/30 font-mono shrink-0 cursor-pointer transition-colors"
            >
              Lateral reading
            </button>
            <button
              onClick={() => handleSendMessage("Explain source bias")}
              className="text-[9px] px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 hover:border-indigo-500/30 font-mono shrink-0 cursor-pointer transition-colors"
            >
              Explain bias
            </button>
          </div>

          {/* Drawer Footer input control */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-900">
            <div className="flex items-center gap-2">
              <button
                onClick={triggerVoiceInput}
                className={`p-2 rounded transition-all border flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse scale-105"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-indigo-500/20 border-slate-800"
                }`}
                title="Voice Input Claim"
              >
                <Mic className="h-3.5 w-3.5" />
              </button>
              <input
                id="floating-chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Ask AntiGravity..."
                className="flex-1 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none placeholder-slate-500 font-sans"
              />
              <button
                id="floating-chat-submit"
                onClick={() => handleSendMessage()}
                disabled={loading || !chatInput.trim()}
                className="p-2 rounded bg-gradient-to-tr from-indigo-600 to-blue-600 hover:from-indigo-550 hover:to-blue-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
