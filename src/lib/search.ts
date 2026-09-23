const stopwords = new Set(["a", "about", "am", "and", "are", "before", "did", "do", "for", "from", "have", "i", "in", "is", "it", "learned", "me", "my", "of", "on", "should", "the", "this", "to", "tomorrow", "what", "when"]);

export function searchTerms(question: string) {
  const terms = question.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((term) => term.length > 1 && !stopwords.has(term)) || [];
  return [...new Set(terms)].slice(0, 8).join(" ");
}
