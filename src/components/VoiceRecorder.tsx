
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/diary';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
      console.log('Speech recognition ended');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const saveEntry = async () => {
    const fullText = transcript.trim();
    if (!fullText) {
      setError('No text to save. Please record something first.');
      return;
    }

    setIsSaving(true);
    try {
      await onTranscriptionComplete(fullText);
      setTranscript('');
      setInterimTranscript('');
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError('Failed to save your diary entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="glass-card p-8 max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ Not Supported</div>
          <p className="text-white/80 mb-4">
            Speech recognition is not supported in this browser.
          </p>
          <p className="text-white/60 text-sm">
            Please try using Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Microphone Button */}
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSaving}
          className={`
            w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105
            ${isRecording 
              ? 'bg-gradient-to-br from-red-400 to-pink-500 animate-pulse-slow' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
            }
            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRecording ? <Square size={48} /> : <Mic size={48} />}
        </button>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="glass-card px-4 py-2">
              <span className="text-white text-sm animate-pulse">Listening...</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {isRecording ? 'Speak your thoughts...' : 'Tap to start recording'}
        </h2>
        <p className="text-white/70">
          {isRecording ? 'Your words will appear below' : 'Share what\'s on your mind'}
        </p>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="glass-card p-6 max-w-2xl w-full animate-fade-in-up">
          <div className="text-white">
            <span className="opacity-100">{transcript}</span>
            <span className="opacity-60 italic">{interimTranscript}</span>
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {transcript && !isRecording && (
        <div className="flex space-x-4 animate-fade-in-up">
          <button
            onClick={saveEntry}
            disabled={isSaving}
            className="glass-button px-8 py-3 text-white font-medium hover:scale-105 transition-transform"
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
          <button
            onClick={clearTranscript}
            className="glass-button px-8 py-3 text-white/80 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 max-w-md animate-fade-in-up border-red-400/30 bg-red-500/10">
          <p className="text-red-200 text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
