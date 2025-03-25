
import { renderHook } from '@testing-library/react-hooks';
import { useImageProcessor } from '../useImageProcessor';
import { useOpenAI } from '@/utils/openai/hook';

jest.mock('@/utils/openai/hook', () => ({
  useOpenAI: jest.fn()
}));

describe('useImageProcessor', () => {
  beforeEach(() => {
    // Setup mock implementation
    (useOpenAI as jest.Mock).mockReturnValue({
      identifyPart: jest.fn().mockResolvedValue('This is a throttle body')
    });
  });
  
  it('should process image query and call success handler', async () => {
    const { result } = renderHook(() => useImageProcessor());
    
    const mockImage = 'data:image/jpeg;base64,/9j...'; // Mock base64 image
    const mockMessage = 'What is this part?';
    const handleSuccess = jest.fn();
    
    const response = await result.current.processImageQuery(
      mockImage,
      mockMessage,
      handleSuccess
    );
    
    // Verify part identification was called
    expect(useOpenAI().identifyPart).toHaveBeenCalledWith(
      mockImage,
      mockMessage
    );
    
    // Verify success handler was called
    expect(handleSuccess).toHaveBeenCalled();
    
    // Verify response format
    expect(response).toEqual({
      text: 'This is a throttle body',
      extra: { image: mockImage }
    });
  });
  
  it('should handle errors from the image identification service', async () => {
    // Setup the mock to throw an error this time
    (useOpenAI as jest.Mock).mockReturnValue({
      identifyPart: jest.fn().mockRejectedValue(new Error('Image processing error'))
    });
    
    const { result } = renderHook(() => useImageProcessor());
    const handleSuccess = jest.fn();
    
    // Expect the promise to be rejected
    await expect(
      result.current.processImageQuery('mock-image', 'What is this?', handleSuccess)
    ).rejects.toThrow('Image processing error');
    
    // Success handler should not be called on error
    expect(handleSuccess).not.toHaveBeenCalled();
  });
  
  it('should include component diagram if provided by the AI', async () => {
    // Setup mock to include component diagram
    (useOpenAI as jest.Mock).mockReturnValue({
      identifyPart: jest.fn().mockResolvedValue({
        text: 'This is an alternator',
        componentDiagram: 'data:image/png;base64,diagram...'
      })
    });
    
    const { result } = renderHook(() => useImageProcessor());
    
    const response = await result.current.processImageQuery(
      'mock-image',
      'What is this?',
      jest.fn()
    );
    
    expect(response).toEqual({
      text: 'This is an alternator',
      extra: { 
        image: 'mock-image',
        componentDiagram: 'data:image/png;base64,diagram...'
      }
    });
  });
});
