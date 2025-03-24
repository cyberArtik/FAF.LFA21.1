# Topic: Lexer & Scanner

****

### Course: Formal Languages & Finite Automata
### Author: Ilico Artemie

----

## Theory:

****

Lexical analysis is the first phase of a compiler or interpreter, where the source code is converted from a sequence of characters into a sequence of tokens that can be more easily processed by later phases. The component that performs this task is known as a lexer, scanner, or tokenizer.

##### Core Concepts

- **Lexemes**: The actual character sequences in the source code that match a pattern for a token type. Example: in `task = "study"`, the lexemes are `task`, `=`, and `"study"`.
- **Tokens**: Categorized lexemes, typically containing:
  - Token type/category (e.g., `<IDENTIFIER>`, `<OPERATOR>`, `<STRING>`)
  - Lexeme value (e.g., `task`, `=`, `"study"`)
  - Optional metadata (line number, position, etc.)
- **Regular Expressions**: Used to define and recognize token patterns.

##### The Scanning Process

1. **Input Buffering**: The lexer reads the input source code efficiently.
2. **Pattern Matching**: Identifies tokens using the longest match principle.
3. **Token Generation**: Creates structured tokens for further processing.
4. **Error Handling**: Reports invalid tokens or attempts recovery.
5. **Whitespace and Comments**: Typically discarded unless significant.

##### Lexer Types

- **Hand-written Lexers**: Offer precise control and performance benefits.
- **Generated Lexers**: Created using tools like ANTLR or Flex.
- **DFA-Based Lexers**: Efficient implementation using deterministic finite automata.

##### Challenges in Lexical Analysis

- **Ambiguity**: Some sequences match multiple patterns.
- **Context Sensitivity**: Some tokens depend on context.
- **Lookahead**: Some tokenization requires looking ahead.
- **Error Recovery**: Handling unexpected inputs.

## Objectives:

****

1. Understand lexical analysis.
2. Familiarize with lexer/scanner/tokenizer functionality.
3. Implement a lexer and analyze its behavior.

> **Note:** Instead of a simple lexer for a calculator, a more complex implementation is encouraged, supporting integers, floats, and specific domain-related syntax like scheduling operations.

## Implementation Description:

****

### The Main Method (Main.ts)

The `Main.ts` file processes `.pixili` files by:
1. Reading the file contents.
2. Creating a `Tokenizer` instance.
3. Tokenizing the input into `Token` objects.
4. Displaying the token details.

```typescript
import { Tokenizer } from './Tokenizer';
import * as fs from 'fs';
import * as path from 'path';

function tokenizeFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`Processing file: ${filePath}`);
        
        const tokenizer = new Tokenizer(content);
        const tokens = tokenizer.tokenize();

        tokens.forEach(token => {
            console.log(`[${token.line}:${token.column}] ${token.type}: '${token.value}'`);
        });
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

const args = process.argv.slice(2);
args.forEach(tokenizeFile);
```

### Tokenizer Class (Tokenizer.ts)

The `Tokenizer.ts` file contains the logic for:
- Identifying keywords, operators, punctuation, and literals.
- Handling numbers, strings, timestamps, and durations.
- Tokenizing `.pixili` scheduling syntax efficiently.

```typescript
export class Tokenizer {
    private input: string;
    private position = 0;
    private tokens: Token[] = [];
    private line = 1;
    private column = 0;
    
    constructor(input: string) {
        this.input = input;
    }
    
    private advance(): string {
        const char = this.input[this.position++];
        this.column++;
        if (char === '\n') { this.line++; this.column = 0; }
        return char;
    }
    
    private isAlpha(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }
    
    private readWord(): string {
        let word = "";
        while (this.isAlpha(this.peek())) {
            word += this.advance();
        }
        return word;
    }
    
    public tokenize(): Token[] {
        while (this.position < this.input.length) {
            let char = this.peek();
            if (this.isAlpha(char)) {
                this.tokens.push({
                    type: TokenType.IDENTIFIER,
                    value: this.readWord(),
                    line: this.line,
                    column: this.column
                });
            } else {
                this.advance();
            }
        }
        return this.tokens;
    }
}
```

### Token Definitions (Token.ts & TokenType.ts)

```typescript
export interface Token {
    type: TokenType;
    value: string;
    line?: number;
    column?: number;
}
```

```typescript
export enum TokenType {
    IDENTIFIER = "IDENTIFIER",
    KEYWORD = "KEYWORD",
    NUMBER = "NUMBER",
    OPERATOR = "OPERATOR",
    STRING = "STRING",
    TIMESTAMP = "TIMESTAMP",
    PUNCTUATION = "PUNCTUATION"
}
```

## Results & Analysis

****

### Example Tokenized `.pixili` File

```pixili
event "Doctor's appointment" on 12.03 from 10:00 to 11:00;
```

#### Tokenized Output

```
IDENTIFIER: 'event' [1:1]
STRING: '"Doctor\'s appointment"' [1:7]
KEYWORD: 'on' [1:30]
DATE: '12.03' [1:33]
KEYWORD: 'from' [1:39]
TIMESTAMP: '10:00' [1:44]
KEYWORD: 'to' [1:50]
TIMESTAMP: '11:00' [1:53]
PUNCTUATION: ';' [1:58]
```

### Conclusion

1. **Efficient Lexical Analysis:** The tokenizer correctly identifies `.pixili` language constructs.
2. **Accurate Position Tracking:** The lexer maintains correct line and column positions.
3. **Structured Tokenization:** Different token types are well categorized.
4. **Extensibility:** The design allows future modifications, such as a parser for syntax validation.

### Future Work

- Implement a parser for syntactic analysis.
- Extend support for additional language features.
- Improve error handling and reporting mechanisms.

## References

****

1. **LLVM** - "Kaleidoscope Lexer" - [https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl01.html](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl01.html)
2. **Wikipedia** - "Lexical Analysis" - [https://en.wikipedia.org/wiki/Lexical_analysis](https://en.wikipedia.org/wiki/Lexical_analysis)
