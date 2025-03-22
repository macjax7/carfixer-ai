
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  date: string;
  codes: DiagnosticCode[];
  notes?: string;
}

interface DiagnosticContextType {
  sessions: DiagnosticSession[];
  currentSession: DiagnosticSession | null;
  addSession: (session: Omit<DiagnosticSession, 'id' | 'date'>) => void;
  updateSession: (id: string, session: Partial<DiagnosticSession>) => void;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string | null) => void;
  addCodeToCurrentSession: (code: DiagnosticCode) => void;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const useDiagnostics = () => {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error('useDiagnostics must be used within a DiagnosticProvider');
  }
  return context;
};

interface DiagnosticProviderProps {
  children: ReactNode;
}

export const DiagnosticProvider: React.FC<DiagnosticProviderProps> = ({ children }) => {
  // Sample diagnostic data
  const [sessions, setSessions] = useState<DiagnosticSession[]>([
    {
      id: '1',
      vehicleId: '1',
      date: '2023-12-10',
      codes: [
        {
          code: 'P0420',
          description: 'Catalyst System Efficiency Below Threshold',
          severity: 'medium',
          date: '2023-12-10'
        }
      ],
      notes: 'Check catalytic converter'
    }
  ]);
  
  const [currentSession, setCurrentSessionState] = useState<DiagnosticSession | null>(null);
  
  const addSession = (sessionData: Omit<DiagnosticSession, 'id' | 'date'>) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionState(newSession);
  };
  
  const updateSession = (id: string, sessionData: Partial<DiagnosticSession>) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, ...sessionData } : session
    ));
    
    if (currentSession?.id === id) {
      setCurrentSessionState(prev => prev ? { ...prev, ...sessionData } : null);
    }
  };
  
  const deleteSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
    if (currentSession?.id === id) {
      setCurrentSessionState(null);
    }
  };
  
  const setCurrentSession = (id: string | null) => {
    if (id === null) {
      setCurrentSessionState(null);
      return;
    }
    
    const session = sessions.find(s => s.id === id);
    setCurrentSessionState(session || null);
  };
  
  const addCodeToCurrentSession = (code: DiagnosticCode) => {
    if (!currentSession) return;
    
    const updatedCodes = [...currentSession.codes, code];
    
    updateSession(currentSession.id, {
      codes: updatedCodes
    });
  };
  
  return (
    <DiagnosticContext.Provider value={{
      sessions,
      currentSession,
      addSession,
      updateSession,
      deleteSession,
      setCurrentSession,
      addCodeToCurrentSession
    }}>
      {children}
    </DiagnosticContext.Provider>
  );
};
