
import { useMemo } from 'react';

export const useSuggestedPrompts = () => {
  const suggestedPrompts = useMemo(() => [
    "What's wrong with my car if it makes a grinding noise when braking?",
    "How do I change my car's oil?",
    "What could cause my check engine light to come on?",
    "How often should I rotate my tires?",
    "What's a good maintenance schedule for a 2018 Honda Civic?"
  ], []);

  return { suggestedPrompts };
};
