
/**
 * Utilities for detecting query types in user messages
 */

/**
 * Check if the message is asking about a specific repair procedure or diagnostic
 */
export function checkForRepairOrDiagnosticQuery(message: string): boolean {
  const repairTerms = [
    'fix', 'repair', 'replace', 'install', 'remove', 'change', 'maintenance',
    'how to', 'steps', 'procedure', 'guide', 'instructions',
    'broken', 'issue', 'problem', 'check', 'diagnose', 'troubleshoot'
  ];
  
  const partTerms = [
    'brake', 'engine', 'transmission', 'tire', 'wheel', 'battery', 'starter',
    'alternator', 'radiator', 'coolant', 'oil', 'filter', 'spark plug',
    'ignition', 'sensor', 'pump', 'belt', 'hose', 'light', 'fuse'
  ];
  
  const repairPattern = new RegExp(`\\b(${repairTerms.join('|')})\\b`, 'i');
  
  const partPattern = new RegExp(`\\b(${partTerms.join('|')})\\b`, 'i');
  
  return repairPattern.test(message) && partPattern.test(message);
}

/**
 * Check if the message is asking for the location of a component
 */
export function checkForComponentLocationQuery(message: string): boolean {
  // Check for location-related terms
  const locationTerms = [
    'where is', 'location of', 'find', 'locate', 'position of', 'where can i find', 
    'where\'s the', 'where are', 'show me', 'diagram', 'schematic', 'placement',
    'locate the', 'point to', 'identify the', 'highlight', 'show the', 'mark'
  ];
  
  // Common automotive components (expanded list)
  const componentTerms = [
    'sensor', 'filter', 'pump', 'relay', 'fuse', 'valve', 'solenoid', 'switch',
    'thermostat', 'belt', 'pulley', 'battery', 'alternator', 'starter', 'spark plug',
    'injector', 'throttle body', 'mass air flow', 'maf', 'egr', 'pcv', 'evap',
    'oxygen sensor', 'o2 sensor', 'camshaft', 'crankshaft', 'knock sensor', 'vvt',
    'timing chain', 'timing belt', 'water pump', 'oil filter', 'air filter', 'cabin filter',
    'fuel pump', 'fuel filter', 'brake caliper', 'brake pad', 'brake rotor', 'master cylinder',
    'wheel bearing', 'cv joint', 'cv axle', 'tie rod', 'control arm', 'strut', 'shock absorber',
    'catalytic converter', 'muffler', 'exhaust manifold', 'intake manifold', 'distributor',
    'ignition coil', 'idle control valve', 'map sensor', 'maf sensor', 'coolant temperature sensor',
    'oil pressure sensor', 'throttle position sensor', 'transmission', 'radiator', 'heater core',
    'ac compressor', 'condenser', 'expansion valve', 'evaporator', 'blower motor', 'power steering',
    'abs', 'ecm', 'pcm', 'ecu', 'tcm', 'bcm', 'fuse box', 'junction box', 'relay box'
  ];
  
  const locationPattern = new RegExp(`\\b(${locationTerms.join('|')})\\b`, 'i');
  const componentPattern = new RegExp(`\\b(${componentTerms.join('|')})\\b`, 'i');
  
  // Check both patterns
  const hasLocationTerm = locationPattern.test(message);
  const hasComponentTerm = componentPattern.test(message);
  
  // Check for a question pattern
  const isQuestion = /\?$|^where|^how|^can you/i.test(message);
  
  // Return true if either:
  // 1. Has both location and component terms
  // 2. Is a question and has a component term
  return (hasLocationTerm && hasComponentTerm) || (isQuestion && hasComponentTerm);
}
