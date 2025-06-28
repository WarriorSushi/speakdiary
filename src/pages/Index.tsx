
import React, { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import DiaryTimeline from '@/components/DiaryTimeline';
import { DiaryEntry } from '@/types/diary';
import { getAllEntries, saveEntry } from '@/utils/storage';
import { Calendar, Mic } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'record' | 'timeline'>('record');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await getAllEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEntry = async (text: string) => {
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      createdAt: new Date()
    };

    try {
      await saveEntry(newEntry);
      setEntries(prev => [newEntry, ...prev]);
      
      // Show success animation and switch to timeline
      setTimeout(() => {
        setCurrentView('timeline');
      }, 1000);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-pulse-slow text-white text-xl">Loading your diary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">SpeakDiary</h1>
          
          {/* Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('record')}
              className={`glass-button px-6 py-3 text-white flex items-center space-x-2 ${
                currentView === 'record' ? 'bg-white/25' : ''
              }`}
            >
              <Mic size={20} />
              <span>Record</span>
            </button>
            <button
              onClick={() => setCurrentView('timeline')}
              className={`glass-button px-6 py-3 text-white flex items-center space-x-2 ${
                currentView === 'timeline' ? 'bg-white/25' : ''
              }`}
            >
              <Calendar size={20} />
              <span>Timeline</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {currentView === 'record' ? (
            <div className="animate-fade-in-up">
              <VoiceRecorder onTranscriptionComplete={handleNewEntry} />
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <DiaryTimeline entries={entries} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
