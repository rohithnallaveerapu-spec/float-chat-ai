import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleChatBox?: () => void;
  isChatBoxOpen?: boolean;
}

export const TopHeader: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onToggleChatBox,
  isChatBoxOpen,
}) => {

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#111316] border-b border-[#44474e]/20 z-50 px-4 md:px-6 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <span className="material-symbols-outlined text-[#6cd7d4] text-2xl animate-pulse">waves</span>
        <div>
          <h1 className="font-bold text-lg md:text-xl text-[#6cd7d4] tracking-tight leading-none">
            FloatChat
          </h1>
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#8e9199] tracking-wider">
            AI Ocean Observations
          </span>
        </div>
      </div>

      {/* Header controls */}
      <div className="flex items-center gap-2.5 relative">
        <button
          onClick={() => {
            if (onToggleChatBox) {
              onToggleChatBox();
            } else {
              setActiveTab('chat');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
            isChatBoxOpen || activeTab === 'chat'
              ? 'bg-[#29a09d] text-[#00302f] border-[#6cd7d4]'
              : 'bg-[#1e2023] text-[#6cd7d4] border-[#6cd7d4]/30 hover:bg-[#6cd7d4]/10'
          }`}
          title="Toggle AI Ocean Chat Box"
        >
          <span className="material-symbols-outlined text-base">psychology</span>
          <span className="hidden sm:inline">AI Chat Box</span>
        </button>
      </div>
    </header>
  );
};

