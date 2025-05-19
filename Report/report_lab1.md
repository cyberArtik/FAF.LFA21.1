# LAB 6 : Parser & Building an Abstract Syntax Tree

### Course: Formal Languages & Finite Automata
### Author: Ilico Artemie, FAF-231

----

## Theory

Parsing is a fundamental process in computer science that analyzes a string of symbols according to the rules of a formal grammar. It transforms raw input into a structured format that can be processed by a computer. This process is crucial in compiler design, natural language processing, and data format validation.

The Abstract Syntax Tree (AST) is a tree representation of the syntactic structure of source code or mathematical expressions. Each node in the tree represents a construct occurring in the source code, with the syntax details abstracted away. The AST represents the hierarchical structure of an expression, making it useful for further processing like evaluation, optimization, or translation to other formats.

Parsing typically occurs in two main stages:

1. **Lexical Analysis (Tokenization)**: Breaking the input into tokens like numbers, operators, and identifiers.
2. **Syntactic Analysis (Parsing)**: Organizing these tokens into a hierarchical structure according to grammar rules.

Various parsing techniques exist, including recursive descent, LL, and LR parsers. In this lab, we implement a recursive descent parser for mathematical expressions, which follows the structure of a context-free grammar directly in code.

## Objectives:

1. Get familiar with parsing, what it is and how it can be programmed.
2. Get familiar with the concept of AST.
3. Implement the following components:
   1. A `TokenType` enum to categorize tokens during lexical analysis.
   2. Use regular expressions to identify token types.
   3. Implement data structures for an AST.
   4. Create a parser program to extract syntactic information from input text.

## Implementation Description

### Token and TokenType Classes

The `TokenType` enumeration defines all possible token categories that our lexer can identify:

```python
class TokenType:
    NUMBER = 'NUMBER'
    FUNCTION = 'FUNCTION'
    OPERATION = 'OPERATION'
    LPAREN = 'LPAREN'
    RPAREN = 'RPAREN'
    PLUS = 'PLUS'
    MINUS = 'MINUS'
    MULTIPLY = 'MULTIPLY'
    DIVIDE = 'DIVIDE'
    POWER = 'POWER'
    SIN = 'SIN'
    COS = 'COS'
    TAN = 'TAN'
    EOL = 'EOL'  # End of Line
    # Additional token types for future expansion
    EQUALS = 'EQUALS'
    NEQUALS = 'NEQUALS'
    LESS_THAN = 'LESS_THAN'
    GREATER_THAN = 'GREATER_THAN'
    LESS_THAN_EQUAL = 'LESS_THAN_EQUAL'
    GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL'
```

The `Token` class represents a token with its type and value:

```python
class Token:
    def __init__(self, token_type, value):
        self.token_type = token_type
        self.value = value

    def __repr__(self):
        return f"{self.token_type}({self.value})"
```

### Abstract Syntax Tree Node

Our AST consists of nodes, each with a type, value, and list of children:

```python
class ASTNode:
    def __init__(self, node_type, value):
        self.node_type = node_type
        self.value = value
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def print(self, prefix="", is_tail=True):
        # Enhanced printing for better readability
        readable_value = str(self.value)
        
        # Map token types to symbols for clearer output
        token_map = {
            'PLUS': '+',
            'MINUS': '-',
            'MULTIPLY': '*',
            'DIVIDE': '/',
            'POWER': '^',
            'SIN': 'sin',
            'COS': 'cos',
            'TAN': 'tan'
        }
        
        if str(self.value) in token_map:
            readable_value = token_map[str(self.value)]
            
        print(f"{prefix}{'└── ' if is_tail else '├── '}{self.node_type}: {readable_value}")
        
        for i in range(len(self.children)):
            self.children[i].print(prefix + ('    ' if is_tail else '│   '), i == len(self.children) - 1)
```

### Lexical Analysis with Regular Expressions

The `Lexer` class uses regular expressions to tokenize the input mathematical expression:

```python
class Lexer:
    def __init__(self, input_text):
        self.input_text = input_text
        self.token_patterns = re.compile(r'(\d+\.\d+|\d+|sin|cos|tan|\+|\-|\*|\/|\^|\(|\)|\s+)')

    def tokenize(self):
        tokens = []
        for match in self.token_patterns.finditer(self.input_text):
            value = match.group(0)
            if value.isdigit() or re.match(r'\d+\.\d+', value):
                tokens.append(Token(TokenType.NUMBER, value))
            elif value == 'sin':
                tokens.append(Token(TokenType.SIN, value))
            elif value == 'cos':
                tokens.append(Token(TokenType.COS, value))
            elif value == 'tan':
                tokens.append(Token(TokenType.TAN, value))
            elif value == '+':
                tokens.append(Token(TokenType.PLUS, value))
            elif value == '-':
                tokens.append(Token(TokenType.MINUS, value))
            elif value == '*':
                tokens.append(Token(TokenType.MULTIPLY, value))
            elif value == '/':
                tokens.append(Token(TokenType.DIVIDE, value))
            elif value == '^':
                tokens.append(Token(TokenType.POWER, value))
            elif value == '(':
                tokens.append(Token(TokenType.LPAREN, value))
            elif value == ')':
                tokens.append(Token(TokenType.RPAREN, value))
            elif value.strip():
                pass  # Skip whitespace
        tokens.append(Token(TokenType.EOL, ""))  # End Of Line token
        return tokens
```

### Recursive Descent Parser

The `Parser` class implements a recursive descent parser using the following key methods:

#### The Parser Class Setup

```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.position = 0

    def get_current_token(self):
        return self.tokens[self.position] if self.position < len(self.tokens) else Token(TokenType.EOL, "")

    def advance(self):
        self.position += 1
```

#### Expression Parsing

The parser follows the grammar rules for mathematical expressions with proper operator precedence:

```python
def parse_expression(self):
    node = self.parse_term()
    while self.get_current_token().token_type in [TokenType.PLUS, TokenType.MINUS]:
        op = self.get_current_token()
        self.advance()
        right = self.parse_term()
        op_node = ASTNode(NodeType.OPERATION, op.token_type)
        op_node.add_child(node)
        op_node.add_child(right)
        node = op_node
    return node
```

This method handles addition and subtraction operations, which have the lowest precedence.

#### Term Parsing

```python
def parse_term(self):
    node = self.parse_factor()
    while self.get_current_token().token_type in [TokenType.MULTIPLY, TokenType.DIVIDE]:
        op = self.get_current_token()
        self.advance()
        right = self.parse_factor()
        op_node = ASTNode(NodeType.OPERATION, op.token_type)
        op_node.add_child(node)
        op_node.add_child(right)
        node = op_node
    return node
```

This method handles multiplication and division operations, which have higher precedence than addition and subtraction.

#### Factor Parsing

```python
def parse_factor(self):
    token = self.get_current_token()
    if token.token_type == TokenType.NUMBER:
        self.advance()
        return ASTNode(NodeType.NUMBER, token.value)
    elif token.token_type in [TokenType.SIN, TokenType.COS, TokenType.TAN]:
        self.advance()
        self.expect(TokenType.LPAREN)
        argument = self.parse_expression()
        self.expect(TokenType.RPAREN)
        func_node = ASTNode(NodeType.FUNCTION, token.token_type)
        func_node.add_child(argument)
        return func_node
    elif token.token_type == TokenType.LPAREN:
        self.advance()
        node = self.parse_expression()
        self.expect(TokenType.RPAREN)
        return node
    else:
        raise RuntimeError(f"Unexpected token: {token.value}")
```

This method handles the highest precedence elements: numbers, function calls, and parenthesized expressions.

## Results

To demonstrate the parser's functionality, I tested it with the complex expression `sin(2+3*4)/(5-2)`. This expression involves multiple layers of nesting, function calls, and different operator precedence levels.

First, the lexer tokenizes the expression:

```
Tokenized expression:
  SIN(sin)
  LPAREN(()
  NUMBER(2)
  PLUS(+)
  NUMBER(3)
  MULTIPLY(*)
  NUMBER(4)
  RPAREN())
  DIVIDE(/)
  LPAREN(()
  NUMBER(5)
  MINUS(-)
  NUMBER(2)
  RPAREN())
```

Then, the parser constructs the AST:

```
Abstract Syntax Tree:
└── OPERATION: /
    ├── FUNCTION: sin
    │   └── OPERATION: +
    │       ├── NUMBER: 2
    │       └── OPERATION: *
    │           ├── NUMBER: 3
    │           └── NUMBER: 4
    └── OPERATION: -
        ├── NUMBER: 5
        └── NUMBER: 2
```

The AST accurately represents the expression with proper operator precedence:

1. The root node is the division operation (`/`)
2. Its left child is the `sin` function applied to the expression `2+3*4`
3. Within the sin function's argument, multiplication (`3*4`) has higher precedence than addition
4. The right child of the division is the subtraction operation `5-2`

This structure correctly preserves the mathematical meaning of the original expression, demonstrating that our parser correctly handles:
- Arithmetic operations with proper precedence
- Nested expressions
- Function application
- Parenthesized grouping

## Conclusions

This laboratory work provided valuable insights into the process of parsing and AST construction. The implementation successfully transforms mathematical expressions into a structured tree representation that preserves the semantics of the original expression.

Key learning points from this implementation include:

1. **Tokenization**: Using regular expressions for breaking input into meaningful tokens proved to be efficient and straightforward.

2. **Recursive Descent Parsing**: This technique allowed for a clear implementation that directly follows the grammar rules of mathematical expressions.

3. **Operator Precedence**: The parser's structure naturally enforces operator precedence through separate methods for expressions, terms, and factors.

4. **Tree Representation**: The AST provides a clear visualization of the expression's structure, making it easy to understand the order of operations.

5. **Error Handling**: The parser includes basic error detection for unexpected tokens, improving robustness.

The implementation demonstrates how parsing techniques form the foundation of language processing tools like compilers and interpreters. The AST representation could be further enhanced to support evaluation of expressions, code generation, or other transformations.

In real-world applications, this technique can be extended to handle more complex language constructs, including variables, assignments, control structures, and custom functions, forming the basis of a complete interpreter or compiler.

## References

1. Wikipedia. *Parsing*. Available at: [https://en.wikipedia.org/wiki/Parsing](https://en.wikipedia.org/wiki/Parsing)
2. Wikipedia. *Abstract Syntax Tree*. Available at: [https://en.wikipedia.org/wiki/Abstract_syntax_tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
3. Aho, A.V., Lam, M.S., Sethi, R., & Ullman, J.D. (2006). *Compilers: Principles, Techniques, and Tools* (2nd ed.). Addison Wesley.
