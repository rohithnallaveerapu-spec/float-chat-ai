import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ArgoFloat } from '../types';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectFloat?: (float: ArgoFloat) => void;
  setActiveTab: (tab: string) => void;
  isProcessing: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const FloatingAiChatBox: React.FC<Props> = ({
  messages,
  onSendMessage,
  setActiveTab,
  isProcessing,
  isOpen,
  setIsOpen,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isProcessing]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handlePresetClick = (promptText: string) => {
    onSendMessage(promptText);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsListening(false);
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const presetQueries = [
    '🎨 Generate image of ARGO float in deep ocean',
    '❓ What is an ARGO float and how does it work?',
    '🎨 Draw a diagram of ocean thermocline layer',
    '❓ Explain why Arabian Sea is saltier than Bay of Bengal',
    'Show ARGO floats in the Indian Ocean',
    'Show temperature profiles in Arabian Sea',
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-[#29a09d] hover:bg-[#208280] text-[#00302f] p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group border border-[#6cd7d4]/40"
          title="Open AI Ocean Chat Box"
          aria-label="Open AI Ocean Chat Box"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
              psychology
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full border-2 border-[#111316] animate-pulse" />
          </div>
          <span className="font-mono text-xs font-bold pr-1 hidden sm:inline">Ask AI</span>
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl border border-[#6cd7d4]/30 bg-[#14181f]/95 backdrop-blur-xl flex flex-col ${
            isMinimized
              ? 'bottom-20 right-4 md:bottom-6 md:right-6 w-80 h-14 overflow-hidden'
              : 'bottom-20 right-2 left-2 sm:left-auto md:bottom-6 md:right-6 w-full sm:w-[420px] h-[540px] max-h-[80vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#1e232d] px-4 py-3 rounded-t-2xl border-b border-[#6cd7d4]/20 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="relative">
                <span className="material-symbols-outlined text-[#6cd7d4] text-xl">smart_toy</span>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#e2e2e6] flex items-center gap-1.5 leading-tight">
                  FloatChat AI
                  <span className="bg-[#6cd7d4]/10 text-[#6cd7d4] text-[9px] font-mono font-normal px-1.5 py-0.5 rounded border border-[#6cd7d4]/20">
                    Online
                  </span>
                </h3>
                <span className="text-[10px] font-mono text-[#8e9199] block leading-tight">
                  ARGO Global Data Engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  setIsOpen(false);
                }}
                className="text-[#8e9199] hover:text-[#6cd7d4] p-1.5 rounded hover:bg-[#282d38] transition-colors"
                title="Expand to Full View"
              >
                <span className="material-symbols-outlined text-sm">open_in_full</span>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-[#8e9199] hover:text-[#e2e2e6] p-1.5 rounded hover:bg-[#282d38] transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <span className="material-symbols-outlined text-sm">
                  {isMinimized ? 'expand_less' : 'remove'}
                </span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8e9199] hover:text-[#ef4444] p-1.5 rounded hover:bg-[#282d38] transition-colors"
                title="Close Chat Box"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 font-sans text-xs">
                {messages.length === 0 && (
                  <div className="text-center py-8 px-4 text-[#8e9199]">
                    <span className="material-symbols-outlined text-3xl text-[#6cd7d4] mb-2 block">
                      waves
                    </span>
                    <p className="font-semibold text-sm text-[#e2e2e6] mb-1">AI Ocean Assistant</p>
                    <p className="text-xs">
                      Ask any question about salinity, ocean temperatures, or ARGO float locations.
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl ${
                          isUser
                            ? 'bg-[#29a09d] text-[#00302f] font-medium rounded-br-none shadow'
                            : 'bg-[#1c222c] border border-[#6cd7d4]/20 text-[#e2e2e6] rounded-bl-none shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed text-[12.5px]">
                          {msg.explanation || msg.text}
                        </p>

                        {/* Generated Image rendering */}
                        {!isUser && msg.generatedImage && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-[#6cd7d4]/30 bg-[#0c0e11] relative">
                            <img
                              src={msg.generatedImage.url}
                              alt={msg.generatedImage.prompt}
                              className="w-full h-auto object-cover max-h-60 rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-2 bg-[#14181f] border-t border-[#44474e]/30 flex justify-between items-center text-[10px] font-mono text-[#8e9199]">
                              <span className="truncate max-w-[75%]" title={msg.generatedImage.prompt}>
                                🎨 {msg.generatedImage.prompt}
                              </span>
                              <a
                                href={msg.generatedImage.url}
                                download={`ocean-ai-generated-${Date.now()}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#6cd7d4] hover:underline flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-xs">download</span>
                                Save
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Summary badge if present */}
                        {!isUser && msg.resultSummary && (
                          <div className="mt-2 pt-2 border-t border-[#44474e]/30 font-mono text-[10px] text-[#6cd7d4] flex flex-wrap gap-2">
                            <span>⚡ {msg.resultSummary.profiles_analyzed} Profiles Analyzed</span>
                            <span>📍 {msg.resultSummary.floats_involved} Active Floats</span>
                          </div>
                        )}
                      </div>

                      {/* Follow-up suggestion buttons */}
                      {!isUser && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-1 max-w-[90%]">
                          {msg.followUpSuggestions.slice(0, 3).map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handlePresetClick(s)}
                              className="bg-[#1c222c] hover:bg-[#28303f] text-[#6cd7d4] border border-[#6cd7d4]/30 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors text-left truncate max-w-full"
                            >
                              💡 {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] font-mono text-[#6b7280] px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isProcessing && (
                  <div className="flex items-center gap-2 p-2.5 bg-[#1c222c] border border-[#6cd7d4]/30 rounded-xl w-fit text-[#6cd7d4]">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span className="font-mono text-[11px] animate-pulse">
                      Processing oceanographic data...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Presets Carousel */}
              <div className="px-3 py-1.5 bg-[#181d26] border-t border-[#44474e]/20 flex gap-1.5 overflow-x-auto scrollbar-hide text-[11px]">
                {presetQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetClick(query)}
                    className="whitespace-nowrap bg-[#222936] hover:bg-[#2c3547] text-[#c4c6cf] hover:text-[#6cd7d4] border border-[#44474e]/30 px-2.5 py-1 rounded-full font-mono text-[10px] transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>

              {/* Chat Box Input Area */}
              <div className="p-3 bg-[#181d26] rounded-b-2xl border-t border-[#44474e]/30">
                <form onSubmit={handleSend} className="relative flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-[#ef4444]/20 text-[#ef4444] animate-pulse'
                        : 'text-[#8e9199] hover:text-[#6cd7d4] hover:bg-[#222936]'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isListening ? 'mic' : 'mic_none'}
                    </span>
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask FloatChat AI..."
                    className="flex-1 bg-[#0f1217] border border-[#44474e]/40 focus:border-[#6cd7d4] text-[#e2e2e6] placeholder-[#8e9199] text-xs px-3 py-2 rounded-xl focus:outline-none transition-all font-sans"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isProcessing}
                    className="bg-[#29a09d] hover:bg-[#208280] disabled:opacity-40 text-[#00302f] p-2 rounded-xl transition-all flex items-center justify-center font-bold"
                    title="Send"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
