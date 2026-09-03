import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'chat', label: 'Ask AI', icon: 'psychology_alt' },
    { id: 'map', label: 'Map', icon: 'map' },
    { id: 'analysis', label: 'Analysis', icon: 'analytics' },
    { id: 'history', label: 'History', icon: 'history' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#1e2023] border-t border-[#44474e]/20 z-50 flex justify-around items-center px-2 md:hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all ${
                isActive
                  ? 'bg-[#29a09d] text-[#00302f] font-semibold scale-105'
                  : 'text-[#c4c6cf] hover:text-[#6cd7d4]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-[9px] font-mono mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-20 bg-[#1e2023] border-r border-[#44474e]/20 fixed left-0 top-14 bottom-0 z-40 items-center py-6 gap-5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-13 py-1.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-[#29a09d] text-[#00302f] shadow-lg shadow-[#6cd7d4]/10'
                  : 'text-[#c4c6cf] hover:bg-[#282a2d] hover:text-[#6cd7d4]'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-[9px] font-mono mt-1 text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </aside>
    </>
  );
};

