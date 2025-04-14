import { RegexNode, RegexNodeType } from "./RegexNode";

export class RegexParser {
    parseRegex(pattern: string): RegexNode {
        let position = { current: 0 };
        return this.parseExpression(pattern, position);
    }

    private parseExpression(pattern: string, position: { current: number }): RegexNode {
        const concatNode = new RegexNode(RegexNodeType.Concatenation);
        
        while (position.current < pattern.length) {
            const currentChar = pattern[position.current];
            
            if (currentChar === ')') break;
            
            if (currentChar === '|') {
                position.current++; // Skip '|'
                const alternationNode = new RegexNode(RegexNodeType.Alternation);
                alternationNode.children.push(concatNode);
                alternationNode.children.push(this.parseExpression(pattern, position));
                return alternationNode;
            }
            
            const termNode = this.parseTerm(pattern, position);
            concatNode.children.push(termNode);
        }
        
        return concatNode;
    }

    private parseTerm(pattern: string, position: { current: number }): RegexNode {
        const currentChar = pattern[position.current];
        let baseNode: RegexNode;
        
        if (currentChar === '(') {
            position.current++; // Skip '('
            baseNode = this.parseExpression(pattern, position);
            
            if (position.current < pattern.length && pattern[position.current] === ')')
                position.current++; // Skip ')'
        } else {
            // Handle literals
            baseNode = new RegexNode(RegexNodeType.Literal);
            baseNode.value = currentChar;
            position.current++;
        }
        
        // Check for repetition operators
        if (position.current < pattern.length) {
            const nextChar = pattern[position.current];
            
            if (nextChar === '+') {
                position.current++;
                return this.createRepetitionNode(baseNode, 1, -1); // 1 or more
            } else if (nextChar === '*') {
                position.current++;
                return this.createRepetitionNode(baseNode, 0, -1); // 0 or more
            } else if (nextChar === '?') {
                position.current++;
                return this.createRepetitionNode(baseNode, 0, 1); // 0 or 1
            } else if (nextChar === '{') {
                position.current++; 
                
                let minRepeat = 0, maxRepeat = 0;
                let numBuilder = '';
                
                while (position.current < pattern.length && /\d/.test(pattern[position.current])) {
                    numBuilder += pattern[position.current];
                    position.current++;
                }
                
                minRepeat = parseInt(numBuilder);
                maxRepeat = minRepeat; 
                
                if (position.current < pattern.length && pattern[position.current] === ',') {
                    position.current++; // Skip ','
                    numBuilder = '';
                    
                    while (position.current < pattern.length && /\d/.test(pattern[position.current])) {
                        numBuilder += pattern[position.current];
                        position.current++;
                    }
                    
                    maxRepeat = numBuilder.length > 0 ? parseInt(numBuilder) : -1;
                }
                
                if (position.current < pattern.length && pattern[position.current] === '}')
                    position.current++; // Skip '}'
                    
                return this.createRepetitionNode(baseNode, minRepeat, maxRepeat);
            }
        }
        
        return baseNode;
    }
    
    private createRepetitionNode(baseNode: RegexNode, minRepeat: number, maxRepeat: number): RegexNode {
        const repetitionNode = new RegexNode(RegexNodeType.Repetition);
        repetitionNode.minRepeat = minRepeat;
        repetitionNode.maxRepeat = maxRepeat;
        repetitionNode.children.push(baseNode);
        return repetitionNode;
    }
}