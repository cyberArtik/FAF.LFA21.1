import { TokenType } from "./TokenType";
import { Token } from "./Token";

export class Tokenizer {
    private input: string;
    private position: number = 0;
    private tokens: Token[] = [];
    private line: number = 1;    
    private column: number = 0;   

    private static keywords = new Set([
        "event", "task", "pomodoro", "import", "export", "new", "iterate",
        "on", "at", "for", "daily", "weekly", "monthly", "repeat", "find",
        "between", "every", "from", "to", "where", "filter", "merge",
        "include", "if", "else", "before", "after", "until", "as", "now",
        "with", "using", "random", "alarm", "each", "times", "of", "break"
    ]);

    private static operators = new Set(["=", "+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">="]);
    private static punctuation = new Set([";", ",", "{", "}", "(", ")", "[", "]"]);
    private static days = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    private static months = new Set(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
    private static durationPattern = /^[0-9]+(h|m)$/;
    private static timeUnits = new Set(["h", "m"]);

    constructor(input: string) {
        this.input = input;
    }

    private advance(): string {
        const char = this.input[this.position++];
        if (char === '\n') {
            this.line++;
            this.column = 0;
        } else {
            this.column++;
        }
        return char;
    }

    private peek(offset = 0): string {
        return this.input[this.position + offset] || "";
    }

    private isAlpha(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }

    private isDigit(char: string): boolean {
        return /[0-9]/.test(char);
    }

    private isWhitespace(char: string): boolean {
        return /\s/.test(char);
    }

    private skipWhitespace(): void {
        while (this.position < this.input.length && this.isWhitespace(this.peek()) && this.peek() !== '\n') {
            this.advance();
        }
    }

    private readWord(): string {
        let word = "";
        while (this.position < this.input.length && (this.isAlpha(this.peek()) || this.isDigit(this.peek()) || this.peek() === '.')) {
            word += this.advance();
        }
        return word;
    }

    private readNumber(): string {
        let num = "";
        while (this.position < this.input.length && this.isDigit(this.peek())) {
            num += this.advance();
        }
        
        if (this.peek() === '.' && this.isDigit(this.peek(1))) {
            num += this.advance(); 
            while (this.position < this.input.length && this.isDigit(this.peek())) {
                num += this.advance();
            }
        }
        
        if (this.position + 1 < this.input.length && 
            ["st", "nd", "rd", "th"].includes(this.peek() + this.peek(1))) {
            num += this.advance() + this.advance();
        }
        
        return num;
    }

    private readString(): string {
        const startLine = this.line;
        const startColumn = this.column;
        
        let str = "";
        this.advance();
        
        while (this.position < this.input.length && this.peek() !== '"') {
            if (this.peek() === '\\' && this.position + 1 < this.input.length) {
                this.advance(); 
                const next = this.peek();
                if (next === 'n') str += '\n';
                else if (next === 't') str += '\t';
                else if (next === 'r') str += '\r';
                else if (next === '"') str += '"';
                else if (next === '\\') str += '\\';
                else str += '\\' + next;
                this.advance();
            } else {
                str += this.advance();
            }
        }
        
        if (this.position >= this.input.length) {
            throw new Error(`Unterminated string starting at line ${startLine}, column ${startColumn}`);
        }
        
        this.advance(); 
        return str;
    }

    private readComment(): string {
        const startPosition = this.position;
        this.advance(); 
        this.advance(); 
        
        while (this.position < this.input.length && this.peek() !== '\n') {
            this.advance();
        }
        
        return this.input.substring(startPosition, this.position).trim();
    }

    private handleTimeFormat(word: string): Token {
        const startLine = this.line;
        const startColumn = this.column - word.length;
        
        // Check if it ends with AM or PM
        if (word.endsWith("AM") || word.endsWith("PM")) {
            return { 
                type: TokenType.TIMESTAMP, 
                value: word,
                line: startLine,
                column: startColumn
            };
        }
        
        return { 
            type: TokenType.IDENTIFIER, 
            value: word,
            line: startLine,
            column: startColumn
        };
    }

    public tokenize(): Token[] {
        while (this.position < this.input.length) {
            const startLine = this.line;
            const startColumn = this.column;
            let char = this.peek();

            if (this.isWhitespace(char)) {
                if (char === "\n") {
                    this.tokens.push({ 
                        type: TokenType.NEWLINE, 
                        value: "\n",
                        line: startLine,
                        column: startColumn
                    });
                }
                this.advance();
            } else if (this.isAlpha(char)) {
                let word = this.readWord();
                
                if (word.includes(":") && (word.endsWith("AM") || word.endsWith("PM"))) {
                    this.tokens.push({ 
                        type: TokenType.TIMESTAMP, 
                        value: word,
                        line: startLine,
                        column: startColumn
                    });
                } else if (Tokenizer.keywords.has(word.toLowerCase())) {
                    this.tokens.push({ 
                        type: TokenType.KEYWORD, 
                        value: word.toLowerCase(),
                        line: startLine,
                        column: startColumn
                    });
                } else if (Tokenizer.days.has(word) || Tokenizer.months.has(word)) {
                    this.tokens.push({ 
                        type: TokenType.DATE, 
                        value: word,
                        line: startLine,
                        column: startColumn
                    });
                } else if (word.includes(".") && /^\d{1,2}\.\d{1,2}(\.\d{2,4})?$/.test(word)) {
                    this.tokens.push({ 
                        type: TokenType.DATE, 
                        value: word,
                        line: startLine,
                        column: startColumn
                    });
                } else {
                    this.tokens.push({ 
                        type: TokenType.IDENTIFIER, 
                        value: word,
                        line: startLine,
                        column: startColumn
                    });
                }
            } else if (this.isDigit(char)) {
                let number = this.readNumber();
                
                if (this.peek() === ':') {
                    number += this.advance(); 
                    if (this.isDigit(this.peek())) {
                        number += this.readNumber();
                        
                        if (this.peek() === 'A' || this.peek() === 'P') {
                            let suffix = this.advance();
                            if (this.peek() === 'M') {
                                suffix += this.advance();
                                number += suffix;
                            } else {
                                this.position--;
                            }
                        }
                        
                        this.tokens.push({ 
                            type: TokenType.TIMESTAMP, 
                            value: number,
                            line: startLine,
                            column: startColumn
                        });
                    } else {
                        this.tokens.push({ 
                            type: TokenType.UNKNOWN, 
                            value: number,
                            line: startLine,
                            column: startColumn
                        });
                    }
                } 
                else if (this.peek() === 'h' || this.peek() === 'm') {
                    number += this.advance();
                    this.tokens.push({ 
                        type: TokenType.DURATION, 
                        value: number,
                        line: startLine,
                        column: startColumn
                    });
                } 
                else if (this.isWhitespace(this.peek()) && 
                         this.isAlpha(this.peek(1)) && 
                         parseInt(number) <= 31) {
                    this.skipWhitespace();
                    const word = this.readWord();
                    if (Tokenizer.months.has(word)) {
                        this.tokens.push({ 
                            type: TokenType.DATE, 
                            value: number + " " + word,
                            line: startLine,
                            column: startColumn
                        });
                    } else {
                        this.tokens.push({ 
                            type: TokenType.NUMBER, 
                            value: number,
                            line: startLine,
                            column: startColumn
                        });
                        this.tokens.push({ 
                            type: TokenType.IDENTIFIER, 
                            value: word,
                            line: startLine,
                            column: startColumn + number.length + 1 
                        });
                    }
                } else {
                    this.tokens.push({ 
                        type: TokenType.NUMBER, 
                        value: number,
                        line: startLine,
                        column: startColumn
                    });
                }
            } else if (char === '"') {
                try {
                    const stringValue = this.readString();
                    this.tokens.push({ 
                        type: TokenType.STRING, 
                        value: stringValue,
                        line: startLine,
                        column: startColumn
                    });
                } catch (error) {
                    console.error(error);
                    this.tokens.push({ 
                        type: TokenType.UNKNOWN, 
                        value: "ERROR: Unterminated string",
                        line: startLine,
                        column: startColumn
                    });
                }
            } else if (char === '/' && this.peek(1) === '/') {
                const commentValue = this.readComment();
                this.tokens.push({ 
                    type: TokenType.COMMENT, 
                    value: commentValue,
                    line: startLine,
                    column: startColumn
                });
            } else if (Tokenizer.operators.has(char)) {
                if (Tokenizer.operators.has(char + this.peek(1))) {
                    const operator = char + this.peek(1);
                    this.advance(); 
                    this.advance(); 
                    this.tokens.push({ 
                        type: TokenType.OPERATOR, 
                        value: operator,
                        line: startLine,
                        column: startColumn
                    });
                } else {
                    this.tokens.push({ 
                        type: TokenType.OPERATOR, 
                        value: this.advance(),
                        line: startLine,
                        column: startColumn
                    });
                }
            } else if (Tokenizer.punctuation.has(char)) {
                this.tokens.push({ 
                    type: TokenType.PUNCTUATION, 
                    value: this.advance(),
                    line: startLine,
                    column: startColumn
                });
            } else {
                this.tokens.push({ 
                    type: TokenType.UNKNOWN, 
                    value: this.advance(),
                    line: startLine,
                    column: startColumn
                });
            }
        }
        return this.tokens;
    }
}