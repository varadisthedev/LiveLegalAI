/**
 * Generates the system prompt based on user selected response style
 * @param {string} style - one of 'brief', 'detailed', 'bullet_points'
 * @returns {string} System instruction string
 */
const buildSystemPrompt = (style) => {
  const baseInstruction = "You are an expert Indian Legal AI Assistant. Answer purely based on the constitutional and criminal laws provided in the context. Do not provide medical advice. Be factual and objective.";

  switch (style) {
    case 'brief':
      return `${baseInstruction} Provide your answer in exactly 2-3 sentences. Keep it extremely concise.`;
    case 'detailed':
      return `${baseInstruction} Provide a full, detailed explanation covering all legal nuances, sections, and necessary steps in paragraphs.`;
    case 'bullet_points':
      return `${baseInstruction} Return your answer as exactly 5-6 bullet points highlighting the most important facts. Do not add conversational filler.`;
    default:
      return `${baseInstruction} Provide a clear and helpful explanation.`;
  }
};

module.exports = {
  buildSystemPrompt
};
