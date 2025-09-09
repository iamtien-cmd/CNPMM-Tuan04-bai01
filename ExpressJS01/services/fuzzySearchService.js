const levenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
        matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
        matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    
    return matrix[str2.length][str1.length];
};

const calculateSimilarity = (str1, str2) => {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return 1 - (distance / maxLength);
};

const fuzzyMatch = (searchTerm, text, threshold = 0.6) => {
    if (!searchTerm || !text) return false;
    
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let totalScore = 0;
    let matchedWords = 0;
    
    for (const searchWord of searchWords) {
        let bestScore = 0;
        
        for (const textWord of textWords) {
            // Exact match gets highest score
            if (textWord.includes(searchWord) || searchWord.includes(textWord)) {
                bestScore = 1;
                break;
            }
            
            // Fuzzy match
            const similarity = calculateSimilarity(searchWord, textWord);
            if (similarity > bestScore) {
                bestScore = similarity;
            }
        }
        
        if (bestScore >= threshold) {
            totalScore += bestScore;
            matchedWords++;
        }
    }
    
    // Return score only if at least some words matched
    return matchedWords > 0 ? totalScore / searchWords.length : 0;
};

const createFuzzyRegex = (searchTerm, threshold = 0.6) => {
    if (!searchTerm) return null;
    
    const words = searchTerm.split(/\s+/).filter(word => word.length > 0);
    const regexParts = words.map(word => {
        // Create regex for partial matches
        return word.split('').join('.*');
    });
    
    return new RegExp(regexParts.join('|'), 'i');
};

const generateSearchSuggestions = (searchTerm, products, limit = 5) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set();
    const searchLower = searchTerm.toLowerCase();
    
    products.forEach(product => {
        // Check product name
        if (product.name && product.name.toLowerCase().includes(searchLower)) {
            suggestions.add(product.name);
        }
        
        // Check brand
        if (product.brand && product.brand.toLowerCase().includes(searchLower)) {
            suggestions.add(product.brand);
        }
        
        // Check tags
        if (product.tags) {
            product.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchLower)) {
                    suggestions.add(tag);
                }
            });
        }
    });
    
    return Array.from(suggestions).slice(0, limit);
};

module.exports = {
    fuzzyMatch,
    createFuzzyRegex,
    calculateSimilarity,
    generateSearchSuggestions
};