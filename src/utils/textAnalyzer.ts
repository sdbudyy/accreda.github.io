// Function to strip HTML tags
const stripHtml = (html: string = ''): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

interface SAOCategories {
  situation: string;
  action: string;
  outcome: string;
}

export const analyzeAndCategorizeText = (text: string): SAOCategories => {
  // Clean the text first
  const cleanText = stripHtml(text).trim();
  
  // Initialize result
  const result: SAOCategories = {
    situation: '',
    action: '',
    outcome: ''
  };

  // If text already contains section markers, use those
  if (text.includes('Situation:') || text.includes('Action:') || text.includes('Outcome:')) {
    const sections = text.split(/(?:Situation:|Action:|Outcome:)/gi);
    // Remove empty sections and trim
    const validSections = sections.filter(s => s.trim()).map(s => s.trim());
    
    if (validSections.length >= 3) {
      result.situation = validSections[0];
      result.action = validSections[1];
      result.outcome = validSections[2];
      return result;
    }
  }

  // If no explicit sections, try to analyze the content
  const paragraphs = cleanText.split(/\n\n+/);
  
  if (paragraphs.length === 1) {
    // Single paragraph - split by sentences
    const sentences = cleanText.split(/[.!?]+\s+/);
    if (sentences.length >= 3) {
      // First 1/3 for situation
      const situationEnd = Math.floor(sentences.length / 3);
      // Middle 1/3 for action
      const actionEnd = Math.floor(sentences.length * 2 / 3);
      
      result.situation = sentences.slice(0, situationEnd).join('. ') + '.';
      result.action = sentences.slice(situationEnd, actionEnd).join('. ') + '.';
      result.outcome = sentences.slice(actionEnd).join('. ');
    } else {
      // Not enough sentences for meaningful split
      result.situation = cleanText;
    }
  } else {
    // Multiple paragraphs
    const totalParagraphs = paragraphs.length;
    
    if (totalParagraphs >= 3) {
      // First 1/3 for situation
      const situationEnd = Math.floor(totalParagraphs / 3);
      // Middle 1/3 for action
      const actionEnd = Math.floor(totalParagraphs * 2 / 3);
      
      result.situation = paragraphs.slice(0, situationEnd).join('\n\n');
      result.action = paragraphs.slice(situationEnd, actionEnd).join('\n\n');
      result.outcome = paragraphs.slice(actionEnd).join('\n\n');
    } else if (totalParagraphs === 2) {
      // Two paragraphs - first is situation, second split between action and outcome
      result.situation = paragraphs[0];
      const secondParagraphSentences = paragraphs[1].split(/[.!?]+\s+/);
      const mid = Math.floor(secondParagraphSentences.length / 2);
      result.action = secondParagraphSentences.slice(0, mid).join('. ') + '.';
      result.outcome = secondParagraphSentences.slice(mid).join('. ');
    } else {
      // Single paragraph case
      result.situation = paragraphs[0];
    }
  }

  return result;
}; 