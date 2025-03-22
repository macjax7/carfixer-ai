
import React, { useState, useRef } from 'react';
import { Mic, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAI } from '@/utils/openai';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { speechToText } = useOpenAI();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            try {
              // Get base64 data string without the prefix
              const base64data = (reader.result as string).split(',')[1];
              
              // Send to OpenAI Whisper API
              const text = await speechToText(base64data);
              
              if (text) {
                onTranscription(text);
              }
            } catch (error) {
              console.error('Error processing speech:', error);
              toast({
                title: "Transcription failed",
                description: "We couldn't process your voice. Please try again.",
                variant: "destructive"
              });
            } finally {
              setIsProcessing(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsProcessing(false);
          toast({
            title: "Error",
            description: "Failed to process audio. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div>
      {isProcessing ? (
        <button
          className="p-2 rounded-full bg-background text-muted-foreground transition-colors"
          disabled
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </button>
      ) : isRecording ? (
        <button
          className="p-2 rounded-full bg-alert text-white hover:bg-alert/90 transition-colors"
          onClick={stopRecording}
          disabled={disabled}
          aria-label="Stop recording"
        >
          <StopCircle className="h-5 w-5" />
        </button>
      ) : (
        <button
          className="p-2 rounded-full bg-carfix-50 text-carfix-600 hover:bg-carfix-100 transition-colors"
          onClick={startRecording}
          disabled={disabled}
          aria-label="Start voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default VoiceInput;
