import React, { useState, useEffect } from 'react';

interface VoiceSearchProps {
  onTranscriptComplete: (transcript: string) => void;
  language?: string; // 'hi-IN' for Hindi/Hinglish, 'en-IN' for English
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onTranscriptComplete,
  language = 'hi-IN'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!supported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText('');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setInterimText(currentTranscript);
      if (event.results[0].isFinal) {
        onTranscriptComplete(currentTranscript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!supported) {
    return (
      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
        🎙️ Voice search is not supported in this browser. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
          isListening
            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
        }`}
        title="Bol kar search karein (Hindi/Hinglish)"
      >
        <span className="text-xl">{isListening ? '🎙️ Listening...' : '🎤 Bol kar khojein'}</span>
      </button>

      {isListening && interimText && (
        <div className="text-sm italic text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
          "{interimText}"
        </div>
      )}
    </div>
  );
};
