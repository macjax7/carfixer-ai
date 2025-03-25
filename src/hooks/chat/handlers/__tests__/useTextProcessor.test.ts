
import { renderHook } from '@testing-library/react-hooks';
import { useTextProcessor } from '../useTextProcessor';
import { useOpenAI } from '@/utils/openai/hook';

// Mock the OpenAI hook
jest.mock('@/utils/openai/hook', () => ({
  useOpenAI: jest.fn()
}));

describe('useTextProcessor', () => {
  beforeEach(() => {
    // Setup mock implementation for the OpenAI hook
    (useOpenAI as jest.Mock).mockReturnValue({
      chatWithAI: jest.fn().mockResolvedValue('This is a mock AI response')
    });
  });
  
  it('should process text query and call success handler', async () => {
    const { result } = renderHook(() => useTextProcessor());
    
    const mockMessages = [{ role: 'user', content: 'Test message' }];
    const mockVehicleInfo = { year: '2020', make: 'Toyota', model: 'Camry' };
    const handleSuccess = jest.fn();
    
    const response = await result.current.processTextQuery(
      mockMessages,
      mockVehicleInfo,
      handleSuccess
    );
    
    // Verify the OpenAI service was called with the right params
    expect(useOpenAI().chatWithAI).toHaveBeenCalledWith(
      mockMessages,
      true,
      mockVehicleInfo
    );
    
    // Verify success handler was called
    expect(handleSuccess).toHaveBeenCalled();
    
    // Verify response is correct
    expect(response).toBe('This is a mock AI response');
  });
  
  it('should handle errors from the OpenAI service', async () => {
    // Setup the mock to throw an error this time
    (useOpenAI as jest.Mock).mockReturnValue({
      chatWithAI: jest.fn().mockRejectedValue(new Error('API error'))
    });
    
    const { result } = renderHook(() => useTextProcessor());
    const handleSuccess = jest.fn();
    
    // Expect the promise to be rejected
    await expect(
      result.current.processTextQuery([], {}, handleSuccess)
    ).rejects.toThrow('API error');
    
    // Success handler should not be called on error
    expect(handleSuccess).not.toHaveBeenCalled();
  });
});
