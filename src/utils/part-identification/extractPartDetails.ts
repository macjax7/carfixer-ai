
interface PartResult {
  name: string;
  partNumber?: string;
  description: string;
  replacementCost?: string;
  difficultyLevel?: string;
  whereToFind?: string;
  symptoms?: string;
}

/**
 * Extract structured part information from AI analysis text
 */
export const extractPartDetails = (analysis: string): PartResult => {
  const result: PartResult = {
    name: 'Unknown Part',
    description: analysis,
  };

  // Extract part name (usually the first line or after "Part Name:" or similar)
  const nameMatch = analysis.match(/^([^:]+?)(?::|\n|$)/) || 
                    analysis.match(/Part(?:\s+)Name(?:\s*):(?:\s*)([^\n]+)/i) ||
                    analysis.match(/Part(?:\s+)Identification(?:\s*):(?:\s*)([^\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }

  // Extract part number if present
  const partNumberMatch = analysis.match(/part(?:\s+)number(?:\s*):(?:\s*)([A-Z0-9-]+)/i) ||
                          analysis.match(/OEM(?:\s+)(?:part(?:\s+))?number(?:\s*):(?:\s*)([A-Z0-9-]+)/i) ||
                          analysis.match(/([A-Z0-9]{5,}-[A-Z0-9]{2,}[A-Z0-9]*)/i);
  if (partNumberMatch && partNumberMatch[1]) {
    result.partNumber = partNumberMatch[1].trim();
  }

  // Extract replacement cost
  const costMatch = analysis.match(/(?:replacement(?:\s+)cost|cost|price)(?:\s*):(?:\s*)([^.]+)/i) ||
                   analysis.match(/\$(\d+(?:,\d+)?(?:\.\d+)?(?:\s*-\s*\$\d+(?:,\d+)?(?:\.\d+)?)?)/i);
  if (costMatch && costMatch[1]) {
    result.replacementCost = costMatch[1].trim();
  }

  // Extract difficulty level
  const difficultyMatch = analysis.match(/difficulty(?:\s+)level(?:\s*):(?:\s*)([^.]+)/i) ||
                         analysis.match(/(?:diy|replacement)(?:\s+)difficulty(?:\s*):(?:\s*)([^.]+)/i);
  if (difficultyMatch && difficultyMatch[1]) {
    result.difficultyLevel = difficultyMatch[1].trim();
  }

  // Extract where to find replacement
  const whereMatch = analysis.match(/(?:where(?:\s+)to(?:\s+)(?:find|buy|purchase)|purchase(?:\s+)options)(?:\s*):(?:\s*)([^.]+(?:\.[^.]+)*)/i);
  if (whereMatch && whereMatch[1]) {
    result.whereToFind = whereMatch[1].trim();
  }

  // Extract symptoms when part fails
  const symptomsMatch = analysis.match(/(?:symptoms|when(?:\s+)this(?:\s+)part(?:\s+)fails|failure(?:\s+)symptoms)(?:\s*):(?:\s*)([^.]+(?:\.[^.]+)*)/i);
  if (symptomsMatch && symptomsMatch[1]) {
    result.symptoms = symptomsMatch[1].trim();
  }

  return result;
};

export type { PartResult };
