
import { supabase } from '@/integrations/supabase/client';

/**
 * Convert speech to text using AI
 */
export async function speechToText(audioBlob: Blob) {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: {
              audio: base64data
            }
          });
          
          if (error) throw new Error(error.message);
          resolve(data.text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
  }
}
