
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatHistoryItem } from './types';

export const useChatHistoryActions = (
  chatHistory: ChatHistoryItem[],
  refreshChatHistory?: () => Promise<void>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveToProjectOpen, setMoveToProjectOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChatSelect = (id: string, e?: React.MouseEvent) => {
    try {
      if (!id) {
        throw new Error('Invalid chat ID');
      }
      
      navigate(`/chat/${id}`);
    } catch (error) {
      console.error("Error selecting chat:", error);
      toast({
        title: "Error loading chat",
        description: "Failed to load the selected conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (error) {
        throw error;
      }

      toast({
        title: "Chat deleted",
        description: "The conversation has been removed from your history."
      });

      if (refreshChatHistory) {
        await refreshChatHistory();
      }

      const currentPath = window.location.pathname;
      if (currentPath.includes(`/chat/${chatId}`)) {
        navigate('/chat');
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error deleting chat",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRenameChat = async () => {
    if (!activeChatId || !newTitle.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Find the chat item to get its original data
      const originalChat = chatHistory.find(chat => chat.id.toString() === activeChatId);
      if (!originalChat) {
        throw new Error("Chat not found");
      }

      // Important: Preserve the original updated_at timestamp to maintain order
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          title: newTitle,
        })
        .eq('id', activeChatId);

      if (error) {
        throw error;
      }

      toast({
        title: "Chat renamed",
        description: "The conversation has been renamed successfully."
      });

      if (refreshChatHistory) {
        await refreshChatHistory();
      }
      
      // Clean up state
      setRenameDialogOpen(false);
      setNewTitle("");
      setActiveChatId(null);
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast({
        title: "Error renaming chat",
        description: "Failed to rename the conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRenameDialog = (chatId: string, currentTitle: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveChatId(chatId);
    setNewTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleMoveToProject = async (projectId: string) => {
    if (!activeChatId) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_items')
        .insert({
          project_id: projectId,
          title: chatHistory.find(chat => chat.id.toString() === activeChatId)?.title || 'Untitled Chat',
          path: `/chat/${activeChatId}`
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Chat moved to project",
        description: "The conversation has been added to the selected project."
      });

      setMoveToProjectOpen(false);
      setActiveChatId(null);
    } catch (error) {
      console.error("Error moving chat to project:", error);
      toast({
        title: "Error moving chat",
        description: "Failed to move the conversation to the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    renameDialogOpen,
    setRenameDialogOpen,
    moveToProjectOpen,
    setMoveToProjectOpen,
    activeChatId,
    setActiveChatId,
    newTitle,
    setNewTitle,
    isSubmitting,
    handleChatSelect,
    handleDeleteChat,
    handleRenameChat,
    handleOpenRenameDialog,
    handleMoveToProject
  };
};
