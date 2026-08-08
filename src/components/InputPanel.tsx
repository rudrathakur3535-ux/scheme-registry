import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, RefreshCw, Tractor, GraduationCap, Palette, Store, HeartHandshake, Volume2, Shield } from 'lucide-react';
import { PRESET_SAMPLES } from '../data/schemes';
import { PresetSample } from '../types';
import { VoiceSearch } from './VoiceSearch';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onParse: (text: string) => void;
  isLoading: boolean;
  presetSamples?: PresetSample[];
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  onParse,
  isLoading,
  presetSamples = PRESET_SAMPLES
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Check Web Speech API availability
  const isSpeechSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const toggleSpeech = () => {
    if (!isSpeechSupported) {
      setSpeechError('Speech recognition is not supported in this browser tab.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechError(`Voice capture note: ${event.error}. You can also type directly.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setSpeechError('Could not start microphone.');
    }
  };

  const handleSelectPreset = (preset: PresetSample) => {
    setInputText(preset.rawInput);
    onParse(preset.rawInput);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tractor': return <Tractor className="w-4 h-4 text-emerald-600" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Palette': return <Palette className="w-4 h-4 text-orange-600" />;
      case 'Store': return <Store className="w-4 h-4 text-indigo-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      default: return <Sparkles className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Panel Top Header Bar */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Unstructured Input (Text / Voice Speech)
          </h2>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded border border-blue-200 dark:border-blue-800">
          Hindi • Hinglish • English Multi-Lingual Engine
        </span>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Preset Profiles Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Example Test Scenarios (Click to auto-fill & extract)
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {presetSamples.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                disabled={isLoading}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-500/50 transition-all text-left group disabled:opacity-50 cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 shadow-2xs group-hover:scale-105 transition-transform">
                  {renderIcon(preset.icon)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-900 dark:group-hover:text-orange-400">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {preset.language}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Box Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Enter User Narrative or Voice Transcript
            </label>

            {/* Voice Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" /> Mic Language:
              </span>
              <select
                value={speechLang}
                onChange={e => setSpeechLang(e.target.value as any)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="hi-IN">Hindi (हिंदी)</option>
                <option value="en-IN">English (India)</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g. 'Mera naam Ramesh hai, umar 32 saal, Bihar Samastipur se. Main kisan hoon, 1.5 acre zameen hai, saalana aamdani ₹75,000 hai, OBC category...'"
              rows={4}
              className="w-full p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute top-3 right-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1 rounded cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {speechError && (
            <div className="text-xs text-orange-800 dark:text-orange-200 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 p-2 rounded-lg">
              {speechError}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleSpeech}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
              <span>{isListening ? 'Listening Voice...' : 'Voice Input'}</span>
            </button>

            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> PII Guardrail Active (Aadhaar/Phone/PAN Auto-Redacted)
            </span>
          </div>

          <button
            onClick={() => onParse(inputText)}
            disabled={isLoading || !inputText.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 active:scale-98 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Extracting with Gemini AI...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Extract Profile & Match Yojanas</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

