
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function useSessionDialog() {
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSessionKeep = () => {
    setShowSessionDialog(false);
    navigate('/', { replace: true });
    toast({
      title: "Session Preserved",
      description: "Your chat history has been saved to your account."
    });
  };

  const handleSessionDiscard = () => {
    // Clear the guest session
    localStorage.removeItem('carfix_guest_session');
    setShowSessionDialog(false);
    navigate('/', { replace: true });
    toast({
      title: "New Session Started",
      description: "You're starting with a fresh chat."
    });
  };

  const SessionDialog = () => (
    <AlertDialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save your chat session?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to save your current chat session and continue where you left off?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleSessionDiscard}>
            Start Fresh
          </Button>
          <Button onClick={handleSessionKeep}>
            Save Session
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    showSessionDialog,
    setShowSessionDialog,
    SessionDialog
  };
}
