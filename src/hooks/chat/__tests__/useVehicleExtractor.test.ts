
import { useVehicleExtractor } from '../useVehicleExtractor';

describe('useVehicleExtractor', () => {
  const { extractVehicleInfo } = useVehicleExtractor();
  
  it('should extract year, make and model from a message', () => {
    const info = extractVehicleInfo('I have a 2015 Toyota Camry with check engine light');
    
    expect(info).toEqual({
      year: '2015',
      make: 'Toyota',
      model: expect.any(String) // The exact model string might vary, but should be present
    });
    
    // The model should include "Camry"
    expect(info?.model.toLowerCase()).toContain('camry');
  });
  
  it('should handle different car makes properly', () => {
    const hondaInfo = extractVehicleInfo('My 2019 Honda Accord is making a noise');
    expect(hondaInfo?.make).toBe('Honda');
    
    const fordInfo = extractVehicleInfo('I own a 2020 Ford F-150');
    expect(fordInfo?.make).toBe('Ford');
    
    const bmwInfo = extractVehicleInfo('My 2018 BMW 3 series has a misfire');
    expect(bmwInfo?.make).toBe('Bmw');
  });
  
  it('should normalize common abbreviations and aliases', () => {
    const chevyInfo = extractVehicleInfo('I have a 2017 Chevy Malibu');
    expect(chevyInfo?.make).toBe('Chevrolet');
    
    const vwInfo = extractVehicleInfo('My 2016 VW Golf has a leak');
    expect(vwInfo?.make).toBe('Volkswagen');
    
    const benzInfo = extractVehicleInfo('I drive a 2018 Mercedes Benz C300');
    expect(benzInfo?.make).toBe('Mercedes-benz');
  });
  
  it('should return null for messages without vehicle information', () => {
    const info = extractVehicleInfo('How do I change oil?');
    expect(info).toBeNull();
  });
  
  it('should use provided default vehicle if available', () => {
    const defaultVehicle = {
      year: 2020,
      make: 'Subaru',
      model: 'Outback',
      vin: '',
      nickname: 'My Car',
      id: '123'
    };
    
    const info = extractVehicleInfo('How do I change oil?', defaultVehicle);
    
    expect(info).toEqual({
      year: '2020',
      make: 'Subaru',
      model: 'Outback'
    });
  });
  
  it('should handle VIN patterns', () => {
    const info = extractVehicleInfo('My VIN is 1HGCM82633A123456');
    
    expect(info).toEqual({
      year: 'Unknown',
      make: 'Unknown',
      model: expect.stringContaining('VIN: 1HGCM82633A123456')
    });
  });
});
