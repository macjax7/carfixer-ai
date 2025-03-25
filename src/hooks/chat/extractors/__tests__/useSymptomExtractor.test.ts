
import { renderHook } from '@testing-library/react-hooks';
import { useSymptomExtractor } from '../useSymptomExtractor';

describe('useSymptomExtractor', () => {
  it('should extract symptoms from user message', () => {
    const { result } = renderHook(() => useSymptomExtractor());
    
    // Test with various messages
    expect(result.current.extractSymptoms('My car has a check engine light on'))
      .toContain('check engine light');
    
    expect(result.current.extractSymptoms('The car is making a knocking noise'))
      .toContain('knocking');
    
    expect(result.current.extractSymptoms('I have poor fuel economy lately'))
      .toContain('poor fuel economy');
  });
  
  it('should extract multiple symptoms from a single message', () => {
    const { result } = renderHook(() => useSymptomExtractor());
    
    const symptoms = result.current.extractSymptoms(
      'My car has rough idle and sometimes stalls when I accelerate'
    );
    
    expect(symptoms).toContain('rough idle');
    expect(symptoms).toContain('stalling');
    expect(symptoms.length).toBeGreaterThanOrEqual(2);
  });
  
  it('should deduplicate symptoms found multiple times', () => {
    const { result } = renderHook(() => useSymptomExtractor());
    
    const symptoms = result.current.extractSymptoms(
      'The check engine light is on. I noticed the check engine light yesterday.'
    );
    
    expect(symptoms).toContain('check engine light');
    expect(symptoms.length).toBe(1); // Should only include once
  });
  
  it('should return empty array for messages with no symptoms', () => {
    const { result } = renderHook(() => useSymptomExtractor());
    
    const symptoms = result.current.extractSymptoms(
      'I have a 2015 Toyota Camry'
    );
    
    expect(symptoms).toEqual([]);
  });
  
  it('should handle case insensitivity', () => {
    const { result } = renderHook(() => useSymptomExtractor());
    
    const symptoms = result.current.extractSymptoms(
      'My car has a CHECK ENGINE LIGHT and ROUgh iDLe'
    );
    
    expect(symptoms).toContain('check engine light');
    expect(symptoms).toContain('rough idle');
  });
});
