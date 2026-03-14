/**
 * Chunks a large string of text into smaller context windows
 * (Simplified chunking logic; for production, use langchain text splitters or sophisticated token chunkers)
 * @param {string} text 
 * @param {number} chunkSize 
 * @param {number} overlap 
 * @returns {string[]}
 */
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text) return [];
  const words = text.split(' ');
  const chunks = [];
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
    // If we've reached the end, break
    if (i + chunkSize >= words.length) break;
  }
  
  return chunks;
};

module.exports = {
  chunkText
};
