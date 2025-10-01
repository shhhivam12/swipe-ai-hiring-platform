/**
 * Text-to-Speech Service using Web Speech API
 * Supports English and Hindi with natural voices
 */

class TTSService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    // Load voices
    const loadVoiceList = () => {
      this.voices = this.synthesis.getVoices();
      this.isInitialized = true;
      console.log('[TTS] Available voices:', this.voices.length);
    };

    loadVoiceList();
    
    // Chrome loads voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoiceList;
    }
  }

  /**
   * Get the best voice for the given language
   */
  private getBestVoice(language: 'en' | 'hi'): SpeechSynthesisVoice | null {
    if (!this.isInitialized || this.voices.length === 0) {
      this.voices = this.synthesis.getVoices();
    }

    const langCode = language === 'en' ? 'en' : 'hi';
    
    // Preferred voice names for natural sound
    const preferredVoices = language === 'en' 
      ? ['Google US English', 'Microsoft Zira', 'Samantha', 'Karen', 'Daniel', 'Google UK English Female']
      : ['Google हिन्दी', 'Microsoft Hemant', 'Lekha', 'Google Hindi'];

    // Try to find preferred voices first
    for (const preferredName of preferredVoices) {
      const voice = this.voices.find(v => v.name.includes(preferredName));
      if (voice) {
        console.log('[TTS] Selected voice:', voice.name);
        return voice;
      }
    }

    // Fallback to any voice matching the language
    const fallbackVoice = this.voices.find(v => v.lang.startsWith(langCode));
    if (fallbackVoice) {
      console.log('[TTS] Using fallback voice:', fallbackVoice.name);
      return fallbackVoice;
    }

    // Last resort: use default voice
    console.warn('[TTS] No matching voice found, using default');
    return this.voices[0] || null;
  }

  /**
   * Speak text with natural intonation
   */
  speak(
    text: string, 
    language: 'en' | 'hi' = 'en',
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
      onStart?: () => void;
      onError?: (error: any) => void;
      onBoundary?: () => void;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.stop();

      // For Hindi, split into smaller chunks if text is long
      const chunks = language === 'hi' && text.length > 100 
        ? this.splitIntoChunks(text, 100)
        : [text];

      const speakChunk = (index: number) => {
        if (index >= chunks.length) {
          console.log('[TTS] Finished all chunks');
          this.currentUtterance = null;
          options?.onEnd?.();
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        const voice = this.getBestVoice(language);
        
        if (voice) {
          utterance.voice = voice;
        }

        // Natural speech settings
        utterance.rate = options?.rate ?? 1.0; // Normal speed by default
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;
        utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';

        utterance.onstart = () => {
          console.log('[TTS] Started chunk', index + 1, ':', chunks[index].substring(0, 50));
          if (index === 0) {
            options?.onStart?.();
          }
        };

        utterance.onboundary = () => {
          options?.onBoundary?.();
        };

        utterance.onend = () => {
          console.log('[TTS] Finished chunk', index + 1);
          // Speak next chunk
          speakChunk(index + 1);
        };

        utterance.onerror = (event) => {
          console.error('[TTS] Error on chunk', index + 1, ':', event);
          // Try to continue with next chunk instead of failing completely
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            speakChunk(index + 1);
          } else {
            this.currentUtterance = null;
            options?.onError?.(event);
            reject(event);
          }
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
      };

      speakChunk(0);
    });
  }

  /**
   * Split text into smaller chunks for better Hindi support
   */
  private splitIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.match(/[^।.!?]+[।.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Speak greeting message
   */
  async speakGreeting(
    candidateName: string,
    jobTitle: string,
    totalQuestions: number,
    language: 'en' | 'hi' = 'en'
  ): Promise<void> {
    const greeting = language === 'en'
      ? `Hello ${candidateName}, welcome to the ${jobTitle} interview. You will be given ${totalQuestions} questions to answer. Each question has a specific time limit. The timer will start after I finish reading the question. Please listen carefully and answer to the best of your ability. Good luck!`
      : `नमस्ते ${candidateName}, ${jobTitle} इंटरव्यू में आपका स्वागत है। आपको ${totalQuestions} प्रश्न दिए जाएंगे। प्रत्येक प्रश्न की एक निश्चित समय सीमा है। मेरे प्रश्न पढ़ने के बाद टाइमर शुरू होगा। कृपया ध्यान से सुनें और अपनी पूरी क्षमता से उत्तर दें। शुभकामनाएं!`;

    return this.speak(greeting, language, { rate: 0.9 });
  }

  /**
   * Speak question
   */
  async speakQuestion(
    questionText: string,
    questionNumber: number,
    totalQuestions: number,
    language: 'en' | 'hi' = 'en'
  ): Promise<void> {
    const intro = language === 'en'
      ? `Question ${questionNumber} of ${totalQuestions}. ${questionText}`
      : `प्रश्न ${questionNumber} का ${totalQuestions}। ${questionText}`;

    return this.speak(intro, language, { rate: 0.9 });
  }
}

export const ttsService = new TTSService();
export default ttsService;
