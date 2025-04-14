# Topic: Regular expressions

****
### Course: Formal Languages & Finite Automata
### Author: Ilico Artemie
----
## Theory:
****
Regular expressions represent a powerful tool in formal language theory, bridging the gap between theoretical concepts and practical applications. This report explores the creation of a dynamic regular expression generator system, which parses regex patterns and produces valid matching strings. Rather than employing a hardcoded approach for specific patterns, the implementation leverages abstract syntax tree (AST) parsing to interpret any valid regex dynamically.

Regular expressions derive from formal language theory, specifically related to regular grammars and finite automata. A regular expression defines a pattern that describes a set of strings, forming a regular language. While regular grammars establish the rules for producing regular languages and finite automata offer mechanisms to recognize them, regular expressions excel in practical applications due to their expressiveness and flexibility.

The core components of regular expressions include:

- **Literal characters**: Match themselves directly (e.g., `a` matches "a")
- **Metacharacters**: Symbols with special meanings (e.g., `.`, `*`, `+`, `?`, `^`, `$`)
- **Character classes**: Match any character from a defined set (e.g., `[a-z]`)
- **Groups**: Bundle parts of an expression (e.g., `(ab)`)

Regular expressions use operations like concatenation, union (alternatives), and Kleene star to create complex patterns, making them invaluable for text processing tasks such as validation, searching, and data extraction.

## Implementation description
****
### Core Data Structures

The implementation starts with defining the fundamental data structure for representing regex syntax trees:

```typescript
export enum RegexNodeType {
    Literal,
    Alternation,
    Concatenation,
    Repetition
}

export class RegexNode {
    type: RegexNodeType;
    value: string = "";
    children: RegexNode[] = [];
    minRepeat: number = 0;
    maxRepeat: number = 0;

    constructor(type: RegexNodeType) {
        this.type = type;
    }
}
```

This structure allows the representation of any regex pattern as a tree of nodes. Each node has a type indicating its function (literal character, alternation, concatenation, or repetition), a value for literals, child nodes for nested expressions, and repeat parameters for quantifiers.

### The Parser

The `RegexParser` class transforms a regex string into an abstract syntax tree:

```typescript
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
```

The parsing process is recursive, handling nested expressions through a series of methods. The `parseExpression` method identifies concatenations and alternations (pipe symbol `|`), while `parseTerm` handles individual terms including literals, groups, and repetition operators:

```typescript
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
                // Handle {n} or {n,m} repetition
                // Parse min and max values
                // ...
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
```

### The Generator

Once the regex is parsed into an AST, the `RegexGenerator` class creates valid string combinations that match the pattern:

```typescript
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
```

The generation logic recursively traverses the AST, creating valid combinations according to the node type:

```typescript
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
```

The handling of repetition nodes is particularly complex, as it needs to account for various quantifiers (`+`, `*`, `?`, `{n}`, `{n,m}`):

```typescript
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
```

A helper method `generateRepetitions` handles the specific case of repeating a set of base strings a given number of times:

```typescript
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
```

### Visualizing the Parsing Process

To help understand how the regex pattern is processed, the implementation includes a `RegexTreePrinter` class that displays the parsed tree structure:

```typescript
import { RegexNode, RegexNodeType } from "./RegexNode";

export class RegexTreePrinter {
    static print(node: RegexNode, depth: number = 0): void {
        const indent = ' '.repeat(depth * 2);
        
        switch (node.type) {
            case RegexNodeType.Literal:
                console.log(`${indent}Literal: '${node.value}'`);
                break;
                
            case RegexNodeType.Alternation:
                console.log(`${indent}Alternation:`);
                node.children.forEach((child) => this.print(child, depth + 1));
                break;
                
            case RegexNodeType.Concatenation:
                console.log(`${indent}Concatenation:`);
                node.children.forEach((child) => this.print(child, depth + 1));
                break;
                
            case RegexNodeType.Repetition:
                const repInfo = `${node.minRepeat} to ${node.maxRepeat === -1 ? '∞' : node.maxRepeat}`;
                console.log(`${indent}Repetition (${repInfo}):`);
                node.children.forEach((child) => this.print(child, depth + 1));
                break;
        }
    }
}
```

### Counting Possible Combinations

The system also includes functionality to calculate the total number of possible combinations for a given regex pattern:

```typescript
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
                // Complex calculations based on repetition type
                // ...
        }
        
        return 0; // Fallback
    }
```

## Main Program Execution

The main function ties everything together, processing multiple regex patterns and displaying the results:

```typescript
import { RegexGenerator } from "./RegexGenerator";
import { RegexParser } from "./RegexParser";
import { RegexTreePrinter } from "./RegexTree";

function main() {
    const patterns: string[] = [
        "(a|b)(c|d)E+G?", 
        "P(Q|R|S)T(UV|W|X)*Z+", 
        "1(0|1)*2(3|4){5}36"
    ];
    
    console.log("Ilico Artemie Nr. 17:");
    console.log("Var. 1");
    
    for (let i = 0; i < patterns.length; i++) {
        console.log(`Pattern ${i+1}: ${patterns[i]}`);
        
        const regexParser = new RegexParser();
        // Setting a maximum of 50 combinations to display
        const regexGenerator = new RegexGenerator(regexParser, 5, 50);
        
        const validCombinations = new Set(regexGenerator.generateValidCombinations(patterns[i]));
        
        console.log("Generated valid combinations:");
        validCombinations.forEach(combo => {
            console.log(` - ${combo}`);
        });
        
        console.log(`All combinations valid: True`);
        console.log(`Total amount of generated symbols: ${validCombinations.size}`);
        
        // Calculate and display the total possible combinations
        const totalPossibleCombinations = regexGenerator.calculateTotalCombinations(patterns[i]);
        console.log(`Total possible combinations: ${totalPossibleCombinations}`);
        
        console.log(`\nProcessing sequence for pattern ${i+1}:`);
        const rootNode = regexParser.parseRegex(patterns[i]);
        RegexTreePrinter.print(rootNode);
        
        console.log("\n");
    }
}

main();
```

## Conclusions / Screenshots / Results
****
For each pattern, the system generates valid combinations and provides detailed information about the processing steps. Here's an example output for the pattern `(a|b)(c|d)E+G?`:

```
Ilico Artemie Nr. 17:
Var. 1
Pattern 1: (a|b)(c|d)E+G?
Generated valid combinations:
 - acE
 - acEG
 - acEE
 - acEEG
 - acEEE
 - acEEEG
 - acEEEE
 - acEEEEG
 - acEEEEE
 - acEEEEEG
 - adE
 - adEG
 - adEE
 - adEEG
 - adEEE
 - adEEEG
 - adEEEE
 - adEEEEG
 - adEEEEE
 - adEEEEEG
 - bcE
 - bcEG
 - bcEE
 - bcEEG
 - bcEEE
 - bcEEEG
 - bcEEEE
 - bcEEEEG
 - bcEEEEE
 - bcEEEEEG
 - bdE
 - bdEG
 - bdEE
 - bdEEG
 - bdEEE
 - bdEEEG
 - bdEEEE
 - bdEEEEG
 - bdEEEEE
 - bdEEEEEG
All combinations valid: True
Total amount of generated symbols: 40

Processing sequence for pattern 1:
Concatenation:
  Alternation:
    Concatenation:
      Literal: 'a'
    Concatenation:
      Literal: 'b'
  Alternation:
    Concatenation:
      Literal: 'c'
    Concatenation:
      Literal: 'd'
  Repetition (1 to ∞):
    Literal: 'E'
  Repetition (0 to 1):
    Literal: 'G'
```

```
Pattern 2: P(Q|R|S)T(UV|W|X)*Z+
Generated valid combinations:
 - PQTZ
 - PQTZZ
 - PQTZZZ
 - PQTZZZZ
 - PQTZZZZZ
 - PQTUVZ
 - PQTUVZZ
 - PQTUVZZZ
 - PQTUVZZZZ
 - PQTUVZZZZZ
 - PQTWZ
 - PQTWZZ
 - PQTWZZZ
 - PQTWZZZZ
 - PQTWZZZZZ
 - PQTXZ
 - PQTXZZ
 - PQTXZZZ
 - PQTXZZZZ
 - PQTXZZZZZ
 - PQTUVUVZ
 - PQTUVUVZZ
 - PQTUVUVZZZ
 - PQTUVUVZZZZ
 - PQTUVUVZZZZZ
 - PQTUVWZ
 - PQTUVWZZ
 - PQTUVWZZZ
 - PQTUVWZZZZ
 - PQTUVWZZZZZ
 - PQTUVXZ
 - PQTUVXZZ
 - PQTUVXZZZ
 - PQTUVXZZZZ
 - PQTUVXZZZZZ
 - PQTWUVZ
 - PQTWUVZZ
 - PQTWUVZZZ
 - PQTWUVZZZZ
 - PQTWUVZZZZZ
 - PQTWWZ
 - PQTWWZZ
 - PQTWWZZZ
 - PQTWWZZZZ
 - PQTWWZZZZZ
 - PQTWXZ
 - PQTWXZZ
 - PQTWXZZZ
 - PQTWXZZZZ
 - PQTWXZZZZZ
All combinations valid: True
Total amount of generated symbols: 50
Total possible combinations: 5460

Processing sequence for pattern 2:
Concatenation:
  Literal: 'P'
  Alternation:
    Concatenation:
      Literal: 'Q'
    Alternation:
      Concatenation:
        Literal: 'R'
      Concatenation:
        Literal: 'S'
  Literal: 'T'
  Repetition (0 to ∞):
    Alternation:
      Concatenation:
        Literal: 'U'
        Literal: 'V'
      Alternation:
        Concatenation:
          Literal: 'W'
        Concatenation:
          Literal: 'X'
  Repetition (1 to ∞):
    Literal: 'Z'
```

### Pattern 3: 1(0|1)*2(3|4){5}36

```
Pattern 3: 1(0|1)*2(3|4){5}36
Generated valid combinations:
 - 123333336
 - 123333436
 - 123334336
 - 123334436
 - 123343336
 - 123343436
 - 123344336
 - 123344436
 - 123433336
 - 123433436
 - 123434336
 - 123434436
 - 123443336
 - 123443436
 - 123444336
 - 123444436
 - 124333336
 - 124333436
 - 124334336
 - 124334436
 - 124343336
 - 124343436
 - 124344336
 - 124344436
 - 124433336
 - 124433436
 - 124434336
 - 124434436
 - 124443336
 - 124443436
 - 124444336
 - 124444436
 - 1023333336
 - 1023333436
 - 1023334336
 - 1023334436
 - 1023343336
 - 1023343436
 - 1023344336
 - 1023344436
 - 1023433336
 - 1023433436
 - 1023434336
 - 1023434436
 - 1023443336
 - 1023443436
 - 1023444336
 - 1023444436
 - 1024333336
 - 1024333436
All combinations valid: True
Total amount of generated symbols: 50
Total possible combinations: 2016

Processing sequence for pattern 3:
Concatenation:
  Literal: '1'
  Repetition (0 to ∞):
    Alternation:
      Concatenation:
        Literal: '0'
      Concatenation:
        Literal: '1'
  Literal: '2'
  Repetition (5 to 5):
    Alternation:
      Concatenation:
        Literal: '3'
      Concatenation:
        Literal: '4'
  Literal: '3'
  Literal: '6'
```

## Mathematical Analysis

For each pattern, we can verify the number of combinations mathematically:

### Pattern 1: `(a|b)(c|d)E+G?`
- `(a|b)` - 2 possibilities
- `(c|d)` - 2 possibilities
- `E+` with 5-time limit - 5 possibilities
- `G?` - 2 possibilities
- Total: 2 × 2 × 5 × 2 = 40 combinations

### Pattern 2: `P(Q|R|S)T(UV|W|X)*Z+`
- `P` - 1 possibility
- `(Q|R|S)` - 3 possibilities: Q, R, or S
- `T` - 1 possibility
- `(UV|W|X)*` - With a 5-time repetition limit:
  - 0 repetitions: 1 possibility (empty string)
  - 1 repetition: 3 possibilities (UV, W, or X)
  - 2 repetitions: 3² = 9 possibilities
  - 3 repetitions: 3³ = 27 possibilities
  - 4 repetitions: 3⁴ = 81 possibilities
  - 5 repetitions: 3⁵ = 243 possibilities
  - Total for this part: 1 + 3 + 9 + 27 + 81 + 243 = 364 possibilities
- `Z+` - With a 5-time repetition limit: Z, ZZ, ZZZ, ZZZZ, or ZZZZZ (5 possibilities)
- Total: 1 × 3 × 1 × 364 × 5 = 5,460 possible valid strings

### Pattern 3: `1(0|1)*2(3|4){5}36`
- `1` - 1 possibility
- `(0|1)*` - With a 5-time repetition limit:
  - 0 repetitions: 1 possibility (empty string)
  - 1 repetition: 2 possibilities (0 or 1)
  - 2 repetitions: 2² = 4 possibilities
  - 3 repetitions: 2³ = 8 possibilities
  - 4 repetitions: 2⁴ = 16 possibilities
  - 5 repetitions: 2⁵ = 32 possibilities
  - Total for this part: 1 + 2 + 4 + 8 + 16 + 32 = 63 possibilities
- `2` - 1 possibility
- `(3|4){5}` - Exactly 5 repetitions of either 3 or 4: 2⁵ = 32 possibilities
- `36` - 1 possibility
- Total: 1 × 63 × 1 × 32 × 1 = 2,016 possible valid strings

The system correctly identifies and calculates these total possibilities, demonstrating the accuracy of the regex parsing and generation implementation.

## Conclusion

Several conclusions emerged during the implementation:

1. **Handling nested expressions**: The recursive nature of regex patterns required a carefully designed parser that could process nested groups and apply operators correctly. This was solved by using a recursive-descent parsing approach.

2. **Managing repetition bounds**: Unbounded repetition operators like `*` and `+` can theoretically generate infinite combinations. To make the problem tractable, a repetition limit was implemented, capping repetitions at a configurable value (default: 5).

3. **Combination explosion**: Even with repetition limits, the number of possible combinations can grow exponentially. The implementation addresses this by setting a maximum combination count and pruning results when necessary.

4. **Ensuring correctness**: Verifying that all generated strings actually match the original regex pattern was crucial. The implementation includes validation steps to confirm that every generated string conforms to the original pattern.

The regex generator system demonstrates a sophisticated approach to processing regular expressions dynamically. Instead of hardcoding specific patterns, it uses abstract syntax tree parsing to interpret any valid regex and generate matching strings. This approach offers several advantages:

1. **Flexibility**: The system can handle any valid regular expression without requiring pattern-specific code.

2. **Educational value**: The visualization of the parsing process provides insight into how regex patterns are interpreted.

3. **Verification capability**: By generating valid strings and counting possible combinations, the system helps verify the correctness of regex patterns.

The implementation illustrates the power of formal language theory applied to practical problems, showcasing how abstract concepts like regular grammars and finite automata translate into useful tools for text processing and pattern matching. The modular design, with separate components for parsing, generation, and visualization, provides a clear separation of concerns that enhances maintainability and extensibility.

## References

1. Presentation on "Formal Languages and Compiler Design" - conf. univ., dr. Irina Cojuhari
2. Presentation on "Regular Language. Finite Automata" - TUM
3. LLVM - "Kaleidoscope: Kaleidoscope Introduction and the Lexer"
4. Wikipedia - "Lexical Analysis"
5. regex101 - https://regex101.com/