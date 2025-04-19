// Polyfill for Web Speech API
// This ensures that the speech recognition and synthesis features work across browsers

// Add TypeScript interfaces for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
    oSpeechRecognition: any;
  }
}

// Initialize speech recognition
export const initSpeechRecognition = (): SpeechRecognition | null => {
  if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    console.warn('Speech recognition is not supported in this browser.');
    return null;
  }

  // Use the appropriate constructor
  const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  try {
    const recognition = new SpeechRecognitionConstructor();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    return recognition;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return null;
  }
};

// Check if speech synthesis is available
export const isSpeechSynthesisAvailable = (): boolean => {
  return 'speechSynthesis' in window;
};

// Get available voices for speech synthesis
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisAvailable()) {
    return [];
  }
  
  return window.speechSynthesis.getVoices();
};

// Get a preferred voice for the assistant
export const getPreferredVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisAvailable()) {
    return null;
  }
  
  const voices = getAvailableVoices();
  
  // If no voices are available yet, return null
  if (voices.length === 0) {
    return null;
  }
  
  // Try to find a good voice (prefer female voices for the assistant)
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Female') || 
    voice.name.includes('Google') || 
    voice.name.includes('Samantha')
  );
  
  // If no preferred voice is found, use the first available voice
  return preferredVoice || voices[0];
};

// Speak text using speech synthesis
export const speakText = (text: string, onEnd?: () => void): void => {
  if (!isSpeechSynthesisAvailable()) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get preferred voice
  const preferredVoice = getPreferredVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  // Set properties
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Set callback
  if (onEnd) {
    utterance.onend = onEnd;
  }
  
  // Speak
  window.speechSynthesis.speak(utterance);
};

export default {
  initSpeechRecognition,
  isSpeechSynthesisAvailable,
  getAvailableVoices,
  getPreferredVoice,
  speakText
};
