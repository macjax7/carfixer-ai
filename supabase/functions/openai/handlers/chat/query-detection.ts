
/**
 * Utilities for detecting query types in user messages
 */

/**
 * Check if the message is asking about a specific repair procedure or diagnostic
 */
export function checkForRepairOrDiagnosticQuery(message: string): boolean {
  const repairTerms = [
    'fix', 'repair', 'replace', 'install', 'remove', 'change', 'maintenance',
    'how to', 'steps', 'procedure', 'guide', 'instructions', 'tutorial',
    'broken', 'issue', 'problem', 'check', 'diagnose', 'troubleshoot',
    'error', 'warning', 'light', 'code', 'fault', 'symptoms'
  ];
  
  const partTerms = [
    'brake', 'engine', 'transmission', 'tire', 'wheel', 'battery', 'starter',
    'alternator', 'radiator', 'coolant', 'oil', 'filter', 'spark plug',
    'ignition', 'sensor', 'pump', 'belt', 'hose', 'light', 'fuse', 'wire',
    'solenoid', 'valve', 'actuator', 'switch', 'relay', 'module', 'computer',
    'ecu', 'pcm', 'tcm', 'bcm', 'abs', 'airbag', 'srs', 'hvac', 'ac', 'heater'
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
    'locate the', 'point to', 'identify the', 'highlight', 'show the', 'mark',
    'where to find', 'how to access', 'how do i get to', 'where would i find',
    'need to find', 'looking for', 'trying to find', 'can\'t find', 'help me find',
    'picture of', 'image of', 'photo of', 'illustration of', 'where exactly is'
  ];
  
  // Common automotive components (expanded list)
  const componentTerms = [
    // Sensors
    'sensor', 'oxygen sensor', 'o2 sensor', 'mass air flow', 'maf sensor', 'map sensor',
    'throttle position sensor', 'tps', 'camshaft position sensor', 'crankshaft position sensor',
    'knock sensor', 'coolant temperature sensor', 'ect sensor', 'oil pressure sensor',
    'vehicle speed sensor', 'vss', 'abs sensor', 'wheel speed sensor', 'iat sensor',
    'intake air temperature', 'egr temperature sensor', 'fuel pressure sensor',
    'manifold absolute pressure', 'barometric pressure sensor', 'baro sensor',
    
    // Filters and fluids components
    'filter', 'oil filter', 'air filter', 'cabin filter', 'fuel filter',
    'transmission filter', 'oil drain plug', 'oil pan', 'coolant reservoir',
    'radiator cap', 'oil dipstick', 'transmission dipstick',
    
    // Pumps and related
    'pump', 'water pump', 'fuel pump', 'oil pump', 'power steering pump',
    'washer fluid pump', 'vacuum pump', 'secondary air pump',
    
    // Engine components
    'spark plug', 'ignition coil', 'distributor', 'injector', 'fuel injector',
    'throttle body', 'intake manifold', 'exhaust manifold', 'egr valve',
    'egr', 'pcv valve', 'pcv', 'evap canister', 'evap', 'timing belt', 
    'timing chain', 'serpentine belt', 'drive belt', 'pulley', 'tensioner',
    'idler pulley', 'camshaft', 'crankshaft', 'piston', 'rod', 'valve cover',
    'cylinder head', 'engine block', 'oil pan', 'head gasket', 'turbocharger',
    'turbo', 'supercharger', 'intercooler', 'wastegate', 'blow off valve',
    
    // Electrical and electronic
    'battery', 'alternator', 'starter', 'relay', 'fuse', 'fuse box',
    'junction box', 'fusible link', 'ignition switch', 'solenoid',
    'starter solenoid', 'control module', 'ecu', 'ecm', 'pcm', 'tcm', 'bcm',
    'eprom', 'computer', 'ground', 'ground point', 'harness', 'wiring harness',
    
    // Transmission and drivetrain
    'transmission', 'trans', 'gearbox', 'clutch', 'flywheel', 'torque converter',
    'shift solenoid', 'valve body', 'differential', 'diff', 'transfer case',
    'driveshaft', 'cv joint', 'cv axle', 'u-joint', 'universal joint',
    
    // Braking system
    'brake caliper', 'brake pad', 'brake rotor', 'brake disc', 'brake drum',
    'brake shoe', 'brake line', 'brake hose', 'master cylinder', 'wheel cylinder',
    'abs module', 'abs pump', 'proportioning valve', 'brake booster',
    
    // Steering and suspension
    'tie rod', 'tie rod end', 'ball joint', 'control arm', 'sway bar',
    'stabilizer bar', 'sway bar link', 'strut', 'shock absorber', 'shock',
    'spring', 'coil spring', 'leaf spring', 'torsion bar', 'steering rack',
    'power steering', 'steering column', 'steering wheel', 'knuckle',
    'hub bearing', 'wheel bearing', 'bushing', 'control arm bushing',
    
    // Exhaust system
    'catalytic converter', 'cat converter', 'resonator', 'muffler',
    'exhaust pipe', 'exhaust manifold', 'downpipe', 'o2 housing',
    'dpf', 'diesel particulate filter', 'scr', 'selective catalytic reduction',
    
    // HVAC system
    'ac compressor', 'a/c compressor', 'condenser', 'evaporator',
    'expansion valve', 'orifice tube', 'heater core', 'blower motor',
    'hvac', 'climate control', 'ac', 'heater',
    
    // Common acronyms and shorthand
    'vvt', 'vtec', 'vct', 'cam sensor', 'crank sensor', 'maf', 'map',
    'tps', 'iat', 'ect', 'abs', 'srs', 'tcc', 'dpfe', 'vgt'
  ];
  
  const locationPattern = new RegExp(`\\b(${locationTerms.join('|')})\\b`, 'i');
  const componentPattern = new RegExp(`\\b(${componentTerms.join('|')})\\b`, 'i');
  
  // Check both patterns
  const hasLocationTerm = locationPattern.test(message);
  const hasComponentTerm = componentPattern.test(message);
  
  // Check for a question pattern
  const isQuestion = /\?$|^where|^how|^can you|^what|^which|^show/i.test(message);
  
  // Return true if either:
  // 1. Has both location and component terms
  // 2. Is a question and has a component term
  // 3. Matches a simplified pattern like "oil filter location" or "location of oil filter"
  const hasComponentLocationPattern = /\b\w+\s+\w+\s+(location|position|diagram|placement)\b/i.test(message) || 
                                     /\b(location|position|diagram|placement)\s+of\s+\w+\s+\w+\b/i.test(message);
  
  return (hasLocationTerm && hasComponentTerm) || 
         (isQuestion && hasComponentTerm) || 
         hasComponentLocationPattern;
}
