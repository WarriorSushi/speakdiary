
import React from 'react';
import { DiaryEntry } from '@/types/diary';
import { Calendar, Clock, Trash } from 'lucide-react';
import { deleteEntry } from '@/utils/storage';

interface DiaryTimelineProps {
  entries: DiaryEntry[];
}

const DiaryTimeline: React.FC<DiaryTimelineProps> = ({ entries }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
        // In a real app, you'd refresh the entries here
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="glass-card p-8 max-w-md">
          <div className="text-white/60 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
          <p className="text-white/70">
            Start recording your first diary entry to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Diary Timeline</h2>
        <p className="text-white/70">{entries.length} entries recorded</p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="glass-card p-6 animate-fade-in-up hover:bg-white/15 transition-all duration-300 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Entry Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-white/80">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span className="text-sm">
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300"
                title="Delete entry"
              >
                <Trash size={16} />
              </button>
            </div>

            {/* Entry Content */}
            <div className="text-white leading-relaxed">
              {entry.text}
            </div>

            {/* Entry Footer */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-white/50 text-xs">
                <span>{entry.text.split(' ').length} words</span>
                <span>
                  Entry #{entries.length - index}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Button */}
      <div className="text-center pt-8">
        <button
          onClick={() => {
            const exportText = entries
              .map(entry => `${formatDate(entry.createdAt)} at ${formatTime(entry.createdAt)}\n\n${entry.text}\n\n---\n\n`)
              .join('');
            
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SpeakDiary_Export_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="glass-button px-6 py-3 text-white hover:scale-105 transition-transform"
        >
          Export All Entries
        </button>
      </div>
    </div>
  );
};

export default DiaryTimeline;
