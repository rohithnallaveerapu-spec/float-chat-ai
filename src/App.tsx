import React, { useState } from 'react';
import { TopHeader } from './components/TopHeader';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AskAiView } from './components/AskAiView';
import { MapExplorerView } from './components/MapExplorerView';
import { AnomalyAnalysisView } from './components/AnomalyAnalysisView';
import { HistoryView } from './components/HistoryView';
import { ArchitectureView } from './components/ArchitectureView';
import { LoginPage, UserProfile } from './components/LoginPage';
import { FloatingAiChatBox } from './components/FloatingAiChatBox';
import { ChatMessage, ArgoFloat } from './types';
import { DEMO_FLOATS } from './data/argoDataset';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(DEMO_FLOATS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);

  // User Profile State (Default logged-in as Dr. Elena Vance)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    name: 'Dr. Elena Vance',
    email: 'elena.vance@incois.gov.in',
    institution: 'INCOIS / NIO Indian Ocean GDAC',
    role: 'Lead Physical Oceanographer',
    avatar: 'EV',
  });

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Initial chat history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Welcome to FloatChat. I am your AI scientific assistant for ARGO global ocean observations. Ask me any question about ocean temperature profiles, salinity, float trajectories, or climate anomalies.',
      timestamp: 'Just now',
      followUpSuggestions: [
        'Show ARGO floats in the Indian Ocean.',
        'Show temperature profiles in the Arabian Sea.',
        'Compare salinity between Arabian Sea and Bay of Bengal.',
        'Find temperature anomalies in North Atlantic.',
      ],
    },
  ]);

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: data.explanation || 'Analyzed oceanographic observations for your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        structuredQuery: data.structuredQuery,
        resultSummary: data.summary,
        visualizationSpec: data.visualizationSpec,
        explanation: data.explanation,
        provenance: data.provenance,
        followUpSuggestions: data.followUpSuggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `Error contacting backend: ${err.message}. Showing local scientific fallback analysis.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUpSuggestions: ['Show ARGO floats in the Indian Ocean.', 'Show trajectory of float 2901234'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111316] text-[#e2e2e6] font-sans antialiased flex flex-col">
      {/* Top Header */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleChatBox={() => setIsChatBoxOpen((prev) => !prev)}
        isChatBoxOpen={isChatBoxOpen}
      />

      {/* Main App Layout */}
      <div className="flex-1 pt-16 pb-20 md:pb-6 md:pl-24 px-4 md:px-8 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            onExecutePrompt={handleSendMessage}
            onSelectFloat={(fl) => setSelectedFloat(fl)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'chat' && (
          <AskAiView
            messages={messages}
            onSendMessage={handleSendMessage}
            onSelectFloat={(fl) => setSelectedFloat(fl)}
            setActiveTab={setActiveTab}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'map' && (
          <MapExplorerView
            selectedFloat={selectedFloat}
            onSelectFloat={(fl) => setSelectedFloat(fl)}
            onExecutePrompt={handleSendMessage}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'analysis' && (
          <AnomalyAnalysisView
            onExecutePrompt={handleSendMessage}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            messages={messages}
            onExecutePrompt={handleSendMessage}
            onSelectFloat={(fl) => setSelectedFloat(fl)}
            setActiveTab={setActiveTab}
            selectedFloat={selectedFloat}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView
            onExecutePrompt={handleSendMessage}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onContinueAsGuest={() => setActiveTab('dashboard')}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* Persistent Floating AI Chat Box */}
      <FloatingAiChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        onSelectFloat={(fl) => setSelectedFloat(fl)}
        setActiveTab={setActiveTab}
        isProcessing={isProcessing}
        isOpen={isChatBoxOpen}
        setIsOpen={setIsChatBoxOpen}
      />

      {/* Navigation (Mobile Bottom + Desktop Left Sidebar) */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;

