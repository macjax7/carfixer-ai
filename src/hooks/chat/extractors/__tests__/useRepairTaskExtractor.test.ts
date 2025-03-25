
import { renderHook } from '@testing-library/react-hooks';
import { useRepairTaskExtractor } from '../useRepairTaskExtractor';

describe('useRepairTaskExtractor', () => {
  it('should extract repair tasks from user message', () => {
    const { result } = renderHook(() => useRepairTaskExtractor());
    
    // Test various types of repair tasks
    expect(result.current.extractRepairTask('I need to change my oil'))
      .toBe('oil change');
    
    expect(result.current.extractRepairTask('How do I replace the brake pads?'))
      .toBe('brake replacement');
    
    expect(result.current.extractRepairTask('My spark plugs need to be replaced'))
      .toBe('spark plug replacement');
  });
  
  it('should match repair tasks based on keywords in context', () => {
    const { result } = renderHook(() => useRepairTaskExtractor());
    
    expect(result.current.extractRepairTask('The transmission is not shifting properly'))
      .toBe('transmission service');
    
    expect(result.current.extractRepairTask('My engine oil is low and needs topping up'))
      .toBe('oil change');
  });
  
  it('should return null when no repair tasks are mentioned', () => {
    const { result } = renderHook(() => useRepairTaskExtractor());
    
    expect(result.current.extractRepairTask('I have a 2018 Ford Focus'))
      .toBeNull();
    
    expect(result.current.extractRepairTask('What is the horsepower of my car?'))
      .toBeNull();
  });
  
  it('should handle case insensitivity', () => {
    const { result } = renderHook(() => useRepairTaskExtractor());
    
    expect(result.current.extractRepairTask('I NEED TO CHANGE MY TIMING BELT'))
      .toBe('timing belt replacement');
    
    expect(result.current.extractRepairTask('how do I check my Brake Fluid level?'))
      .toBe('brake replacement');
  });
  
  it('should identify the correct task when multiple keywords are present', () => {
    const { result } = renderHook(() => useRepairTaskExtractor());
    
    // This message contains keywords for both oil change and air filter
    const task = result.current.extractRepairTask(
      'I want to change my oil and also replace the air filter'
    );
    
    // It should match the first one it finds based on the code implementation
    expect(['oil change', 'air filter replacement']).toContain(task);
  });
});
