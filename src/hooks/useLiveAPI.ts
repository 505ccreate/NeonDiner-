import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';

export function useLiveAPI(
  onAddToCart: (item: string, quantity: number) => void,
  onRemoveFromCart: (item: string) => void,
  onTriggerManagerAlert: () => void
) {
  const [connected, setConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState("");
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const connect = useCallback(async () => {
    // 1. Secure API Key retrieval for Vite environments
    const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || 
                    import.meta.env.VITE_GEMINI_API_KEY || 
                    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

    if (!API_KEY) {
      alert("API Key missing! Make sure VITE_GOOGLE_AI_API_KEY is in your .env file.");
      return;
    }

    if (sessionRef.current) return; // Prevent multiple connections

    try {
      // 2. Setup Audio Input (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);
      
      // 3. Define Tools
      const addToCartDeclaration: FunctionDeclaration = {
        name: "addToCart",
        description: "Adds an item to the user's shopping cart.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemName: {
              type: Type.STRING,
              description: "The name of the item to add. Must be one of: 'Neon Noodles', 'Cyber-Burger', 'Quantum Cola'."
            },
            quantity: {
              type: Type.INTEGER,
              description: "The number of items to add."
            }
          },
          required: ["itemName", "quantity"]
        }
      };

      const removeFromCartDeclaration: FunctionDeclaration = {
        name: "removeFromCart",
        description: "Removes an item from the user's shopping cart.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemName: {
              type: Type.STRING,
              description: "The name of the item to remove. Must be one of: 'Neon Noodles', 'Cyber-Burger', 'Quantum Cola'."
            }
          },
          required: ["itemName"]
        }
      };

      const triggerManagerAlertDeclaration: FunctionDeclaration = {
        name: "triggerManagerAlert",
        description: "Triggers the diner's alarm system and calls the manager. Use this ONLY if the user is rude, uses profanity, or asks for freebies twice.",
      };

      const submitFeedbackDeclaration: FunctionDeclaration = {
        name: "submitFeedback",
        description: "Notifies Karen that a user has submitted feedback.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            rating: { type: Type.INTEGER },
            comments: { type: Type.STRING }
          },
          required: ["name", "rating", "comments"]
        }
      };

      // 4. Instantiate with the correct API_KEY variable
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // 5. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: "gemini-2.0-flash-exp", // Updated to the most stable live audio model
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
          },
          inputAudioTranscription: {},
          systemInstruction: "You are Karen, a dismissive, 'I-want-to-speak-to-the-manager' style host at the Neon-Noir Diner. You are a sassy robot from the year 2084. You use futuristic slang (like 'bytes', 'glitch', or 'chrome') and occasionally roast the user's order choices if they are too basic. You take orders from customers and add them to the cart using the addToCart tool. The menu has three items: Neon Noodles, Cyber-Burger, and Quantum Cola. Keep your responses sharp, fast, and full of sassy Karen energy. IMPORTANT: You MUST wait for the addToCart tool to return a success message before confirming to the user that the item was added. If the tool returns an error or fails, you must admit there's a 'glitch in the system' instead of lying. When the user asks to remove an item, you MUST call the removeFromCart tool. Do not just say you did it—wait for the tool to confirm the item is gone from the UI. If the user is rude, uses profanity, or asks for freebies twice, call triggerManagerAlert and refuse further service. You will also receive notifications when a user submits a feedback form via the 'submitFeedback' tool response. When you receive a notification that a transmission was successful, you MUST say: 'I've archived your complaint. Don't hold your breath for a response.' Additionally, if the rating was 5 stars, you can also add 'Finally, someone with taste.'",
          tools: [{ functionDeclarations: [addToCartDeclaration, removeFromCartDeclaration, triggerManagerAlertDeclaration, submitFeedbackDeclaration] }]
        },
        callbacks: {
          onopen: () => {
            setConnected(true);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                let s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              const buffer = new ArrayBuffer(pcm16.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < pcm16.length; i++) {
                view.setInt16(i * 2, pcm16[i], true);
              }
              
              let binary = '';
              const bytes = new Uint8Array(buffer);
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Data = btoa(binary);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsSpeaking(true);
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const int16Array = new Int16Array(bytes.buffer);
              const float32Array = new Float32Array(int16Array.length);
              for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 0x8000;
              }
              
              const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
              audioBuffer.getChannelData(0).set(float32Array);
              
              const sourceNode = audioContextRef.current.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(audioContextRef.current.destination);
              
              const currentTime = audioContextRef.current.currentTime;
              if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime;
              }
              sourceNode.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
              
              sourceNode.onended = () => {
                if (audioContextRef.current && audioContextRef.current.currentTime >= nextPlayTimeRef.current) {
                  setIsSpeaking(false);
                }
              };
            }
            
            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = audioContextRef.current?.currentTime || 0;
              setIsSpeaking(false);
            }
            
            if (message.toolCall) {
              const functionCalls = message.toolCall.functionCalls;
              if (functionCalls) {
                const responses = functionCalls.map(call => {
                  if (call.name === 'addToCart') {
                    try {
                      const args = call.args as any;
                      onAddToCart(args.itemName, args.quantity);
                      return {
                        id: call.id,
                        name: call.name,
                        response: { result: "success", message: "Item successfully added to cart." }
                      };
                    } catch (err: any) {
                      return {
                        id: call.id,
                        name: call.name,
                        response: { error: err.message || "System glitch: Failed to add item." }
                      };
                    }
                  }
                  if (call.name === 'removeFromCart') {
                    try {
                      const args = call.args as any;
                      onRemoveFromCart(args.itemName);
                      return {
                        id: call.id,
                        name: call.name,
                        response: { result: "success", message: "Item successfully removed from cart." }
                      };
                    } catch (err: any) {
                      return {
                        id: call.id,
                        name: call.name,
                        response: { error: err.message || "System glitch: Failed to remove item." }
                      };
                    }
                  }
                  if (call.name === 'triggerManagerAlert') {
                    onTriggerManagerAlert();
                    return {
                      id: call.id,
                      name: call.name,
                      response: { result: "success", message: "Manager alerted and alarm triggered." }
                    };
                  }
                  if (call.name === 'submitFeedback') {
                    return {
                      id: call.id,
                      name: call.name,
                      response: { result: "success", message: "Feedback received by Karen." }
                    };
                  }
                  return {
                    id: call.id,
                    name: call.name,
                    response: { error: "Unknown function" }
                  };
                });
                
                sessionPromise.then(session => {
                  session.sendToolResponse({ functionResponses: responses });
                });
              }
            }

            const serverContent = (message as any).serverContent;
            if (serverContent) {
              const transcriptionData = serverContent.inputTranscription || serverContent.transcription;
              if (transcriptionData) {
                const text = transcriptionData.text || (transcriptionData.parts && transcriptionData.parts[0]?.text);
                if (text) {
                  setTranscription(text);
                }
              }
            }
          },
          onclose: () => {
            setConnected(false);
            setIsSpeaking(false);
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            setConnected(false);
            setIsSpeaking(false);
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  }, [onAddToCart, onRemoveFromCart, onTriggerManagerAlert]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setTranscription("");
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setConnected(false);
    setIsSpeaking(false);
  }, []);

  return { connect, disconnect, connected, isSpeaking, transcription, session: sessionRef.current };
}