import { RegexNode, RegexNodeType } from "./RegexNode";
import { RegexParser } from "./RegexParser";

export class RegexGenerator {
    private _repetitionLimit: number;
    private _regexParser: RegexParser;
    private _maxCombinations: number;
    
    constructor(regexParser: RegexParser, repetitionLimit: number = 5, maxCombinations: number = 50) {
        this._repetitionLimit = repetitionLimit;
        this._regexParser = regexParser;
        this._maxCombinations = maxCombinations;
    }

    generateValidCombinations(pattern: string): string[] {
        const rootNode = this._regexParser.parseRegex(pattern);
        return this.generateCombinationsFromNode(rootNode);
    }
    
    private generateCombinationsFromNode(node: RegexNode): string[] {
        let results: string[] = [];
        
        switch (node.type) {
            case RegexNodeType.Literal:
                results.push(node.value);
                break;
                
            case RegexNodeType.Alternation:
                for (const child of node.children) {
                    results.push(...this.generateCombinationsFromNode(child));
                    if (results.length > this._maxCombinations) {
                        results = results.slice(0, this._maxCombinations);
                        break;
                    }
                }
                break;
                
            case RegexNodeType.Concatenation:
                // Start with empty string
                results.push("");
                
                // For each child, generate combinations and append to current results
                for (const child of node.children) {
                    const childCombos = this.generateCombinationsFromNode(child);
                    const newResults: string[] = [];
                    
                    for (const existingResult of results) {
                        for (const childCombo of childCombos) {
                            newResults.push(existingResult + childCombo);
                            if (newResults.length >= this._maxCombinations) break;
                        }
                        if (newResults.length >= this._maxCombinations) break;
                    }
                    
                    results = newResults.slice(0, this._maxCombinations);
                }
                break;
                
            case RegexNodeType.Repetition:
                const baseResults = this.generateCombinationsFromNode(node.children[0]);
                results.push(""); // Empty case for * and ?
                
                if (node.minRepeat === 0 && node.maxRepeat === 1) { // ? (0 or 1)
                    results.push(...baseResults);
                } else if (node.minRepeat === 1 && node.maxRepeat === -1) { // + (1 or more)
                    // Generate combinations for 1 to repetitionLimit
                    for (let count = 1; count <= this._repetitionLimit; count++) {
                        const combinations = this.generateRepetitions(baseResults, count);
                        results.push(...combinations);
                        if (results.length > this._maxCombinations) {
                            results = results.slice(0, this._maxCombinations);
                            break;
                        }
                    }
                    if (results[0] === "") results.shift(); // Remove empty string for + operator
                } else if (node.minRepeat === 0 && node.maxRepeat === -1) { // * (0 or more)
                    // Generate combinations for 0 to repetitionLimit
                    for (let count = 1; count <= this._repetitionLimit; count++) {
                        const combinations = this.generateRepetitions(baseResults, count);
                        results.push(...combinations);
                        if (results.length > this._maxCombinations) {
                            results = results.slice(0, this._maxCombinations);
                            break;
                        }
                    }
                } else { // {n} or {n,m}
                    const max = node.maxRepeat === -1 
                        ? this._repetitionLimit 
                        : Math.min(node.maxRepeat, this._repetitionLimit);
                    
                    for (let count = node.minRepeat; count <= max; count++) {
                        const combinations = this.generateRepetitions(baseResults, count);
                        results.push(...combinations);
                        if (results.length > this._maxCombinations) {
                            results = results.slice(0, this._maxCombinations);
                            break;
                        }
                    }
                    
                    if (node.minRepeat > 0 && results[0] === "") {
                        results.shift(); // Remove empty string for {n,m} where n > 0
                    }
                }
                break;
        }
        
        return results.slice(0, this._maxCombinations);
    }
    
    private generateRepetitions(baseStrings: string[], count: number): string[] {
        if (count === 0)
            return [""];
            
        if (count === 1)
            return baseStrings;
            
        const result: string[] = [];
        const subResults = this.generateRepetitions(baseStrings, count - 1);
        
        for (const subResult of subResults) {
            for (const baseStr of baseStrings) {
                result.push(subResult + baseStr);
                if (result.length >= this._maxCombinations) break;
            }
            if (result.length >= this._maxCombinations) break;
        }
        
        return result.slice(0, this._maxCombinations);
    }

    // New method to calculate total possible combinations
    calculateTotalCombinations(pattern: string): number {
        const rootNode = this._regexParser.parseRegex(pattern);
        return this.countCombinationsFromNode(rootNode);
    }
    
    private countCombinationsFromNode(node: RegexNode): number {
        switch (node.type) {
            case RegexNodeType.Literal:
                return 1; // A literal has exactly one possibility
                
            case RegexNodeType.Alternation:
                // Sum the count from each alternative
                return node.children.reduce((total, child) => 
                    total + this.countCombinationsFromNode(child), 0);
                
            case RegexNodeType.Concatenation:
                // Multiply the counts from each concatenated part
                return node.children.reduce((total, child) => 
                    total === 0 ? this.countCombinationsFromNode(child) 
                                : total * this.countCombinationsFromNode(child), 1);
                
            case RegexNodeType.Repetition:
                const baseCount = this.countCombinationsFromNode(node.children[0]);
                let totalCount = 0;
                
                // Calculate based on repetition type
                if (node.minRepeat === 0 && node.maxRepeat === 1) { // ?
                    totalCount = 1 + baseCount; // empty string + base options
                } else if (node.minRepeat === 0 && node.maxRepeat === -1) { // *
                    // Sum up combinations from 0 to repetitionLimit
                    for (let i = 0; i <= this._repetitionLimit; i++) {
                        totalCount += Math.pow(baseCount, i);
                    }
                } else if (node.minRepeat === 1 && node.maxRepeat === -1) { // +
                    // Sum up combinations from 1 to repetitionLimit
                    for (let i = 1; i <= this._repetitionLimit; i++) {
                        totalCount += Math.pow(baseCount, i);
                    }
                } else {
                    // Handle {n} or {n,m}
                    const max = node.maxRepeat === -1 
                        ? this._repetitionLimit 
                        : Math.min(node.maxRepeat, this._repetitionLimit);
                    
                    for (let i = node.minRepeat; i <= max; i++) {
                        totalCount += Math.pow(baseCount, i);
                    }
                }
                
                return totalCount;
        }
        
        return 0; // Fallback
    }

    // Helper method to break down the calculation step by step
    explainPatternCombinations(pattern: string): string {
        const rootNode = this._regexParser.parseRegex(pattern);
        let explanation = `Breaking down the pattern "${pattern}":\n`;
        explanation += this.explainNodeCombinations(rootNode, 0);
        return explanation;
    }

    private explainNodeCombinations(node: RegexNode, depth: number): string {
        const indent = '* '.repeat(depth);
        let explanation = '';

        switch (node.type) {
            case RegexNodeType.Literal:
                explanation += `${indent}\`${node.value}\` - 1 possibility\n`;
                break;

            case RegexNodeType.Alternation:
                explanation += `${indent}(`;
                const alternativeExplanations = node.children.map(child => {
                    const childCount = this.countCombinationsFromNode(child);
                    return `${this.explainNodeCombinations(child, 0).trim()}`;
                });
                explanation += alternativeExplanations.join(' | ');
                explanation += `) - ${this.countCombinationsFromNode(node)} possibilities\n`;
                break;

            case RegexNodeType.Concatenation:
                if (depth === 0) {
                    node.children.forEach(child => {
                        explanation += this.explainNodeCombinations(child, depth + 1);
                    });
                } else {
                    explanation += `${indent}Concatenation of ${node.children.length} elements - ${this.countCombinationsFromNode(node)} possibilities\n`;
                    node.children.forEach(child => {
                        explanation += this.explainNodeCombinations(child, depth + 1);
                    });
                }
                break;

            case RegexNodeType.Repetition:
                const baseCount = this.countCombinationsFromNode(node.children[0]);
                let repExplanation = '';
                
                if (node.minRepeat === 0 && node.maxRepeat === 1) {
                    repExplanation = `${node.children[0].value}? - 2 possibilities (present or not)`;
                } else if (node.minRepeat === 0 && node.maxRepeat === -1) {
                    repExplanation = `${node.children[0].value}* - With a ${this._repetitionLimit}-time repetition limit:`;
                    let totalCount = 0;
                    for (let i = 0; i <= this._repetitionLimit; i++) {
                        const count = Math.pow(baseCount, i);
                        repExplanation += `\n${indent}  ${i} repetitions: ${baseCount}^${i} = ${count} possibilities`;
                        totalCount += count;
                    }
                    repExplanation += `\n${indent}  Total for this part: ${totalCount} possibilities`;
                } else if (node.minRepeat === 1 && node.maxRepeat === -1) {
                    repExplanation = `${node.children[0].value}+ - With a ${this._repetitionLimit}-time repetition limit:`;
                    let totalCount = 0;
                    for (let i = 1; i <= this._repetitionLimit; i++) {
                        const count = Math.pow(baseCount, i);
                        repExplanation += `\n${indent}  ${i} repetitions: ${baseCount}^${i} = ${count} possibilities`;
                        totalCount += count;
                    }
                    repExplanation += `\n${indent}  Total for this part: ${totalCount} possibilities`;
                } else {
                    const max = node.maxRepeat === -1 ? this._repetitionLimit : node.maxRepeat;
                    repExplanation = `${node.children[0].value}{${node.minRepeat},${max === this._repetitionLimit ? '∞' : max}} - With repetition limits:`;
                    let totalCount = 0;
                    for (let i = node.minRepeat; i <= max; i++) {
                        const count = Math.pow(baseCount, i);
                        repExplanation += `\n${indent}  ${i} repetitions: ${baseCount}^${i} = ${count} possibilities`;
                        totalCount += count;
                    }
                    repExplanation += `\n${indent}  Total for this part: ${totalCount} possibilities`;
                }
                
                explanation += `${indent}${repExplanation}\n`;
                break;
        }
        
        return explanation;
    }
}