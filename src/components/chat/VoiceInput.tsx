
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useOpenAI } from '@/utils/openai';
import { toast } from '../ui/use-toast';

const VoiceInput = ({ onTranscription, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { speechToText } = useOpenAI();

  useEffect(() => {
    return () => {
      // Clean up recording when component unmounts
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Convert audio chunks to blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioBlob(audioBlob);
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access your microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudioBlob = async (audioBlob) => {
    try {
      const text = await speechToText(audioBlob);
      if (text) {
        onTranscription(text);
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      toast({
        title: 'Transcription Error',
        description: 'Unable to convert your speech to text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggleRecording}
      disabled={disabled || isProcessing}
      className="flex-shrink-0"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5 text-destructive" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isRecording ? 'Stop recording' : 'Start recording'}
      </span>
    </Button>
  );
};

export default VoiceInput;
