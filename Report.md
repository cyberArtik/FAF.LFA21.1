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
## Core Structure

At the heart of the implementation is the `RegexNode` class which forms the building blocks of the AST:

```typescript
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

Each node has a specific type (literal, alternation, concatenation, or repetition) that determines how it's processed. This design enables the representation of complex regex patterns as a hierarchical structure.

## Parsing Process

The `RegexParser` class transforms regex strings into ASTs through recursive descent parsing:

```typescript
export class RegexParser {
  parseRegex(pattern: string): RegexNode {
    let position = { current: 0 };
    return this.parseExpression(pattern, position);
  }

  // Additional parsing methods would be implemented here
}
```

It walks through the input pattern character by character, creating appropriate nodes based on regex operators it encounters. When it finds literals (basic characters), it creates literal nodes. For alternation symbols (`|`), it builds branches in the tree. Adjacent elements become children of concatenation nodes, while repetition operators (`*`, `+`, `?`, `{n,m}`) create repetition nodes with specific min/max values.

## Generation Logic

The `RegexGenerator` takes a parsed AST and produces strings that match the pattern:

```typescript
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

  // Additional generation methods would be implemented here
}
```

The generator works recursively through the AST, handling each node type differently. Literal nodes return their character value, alternation nodes select from their branches, concatenation nodes join results from each child, and repetition nodes duplicate their child content appropriately.

The implementation includes safeguards to prevent exponential expansion: a repetition limit (default: 5) prevents infinite or excessive loops, and a maximum combinations limit (default: 50) caps total output.

## Visualization and Analysis

The implementation includes a `RegexTreePrinter` that displays the parsed tree structure:

```typescript
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
      
      // Additional cases would be implemented for other node types
    }
  }
}
```

The system also calculates the total number of possible combinations for a pattern by analyzing the structure of the AST. For each node type, it applies different counting rules: literal nodes contribute exactly one possibility, alternation nodes sum the counts from each alternative, concatenation nodes multiply the counts from each part, and repetition nodes apply combinatorial calculations.

## Usage Example

A main function ties everything together:

```typescript
function main() {
  const patterns = [
    "(a|b)(c|d)E+G?",
    "P(Q|R|S)T(UV|W|X)*Z+",
    "1(0|1)*2(3|4){5}36"
  ];

  for (let i = 0; i < patterns.length; i++) {
    console.log(`Pattern ${i+1}: ${patterns[i]}`);
    
    const regexParser = new RegexParser();
    const regexGenerator = new RegexGenerator(regexParser, 5, 50);
    
    const validCombinations = new Set(regexGenerator.generateValidCombinations(patterns[i]));
    console.log("Generated valid combinations:");
    validCombinations.forEach(combo => {
      console.log(` - ${combo}`);
    });
    
    // Display additional information and visualize the tree
  }
}
```

When processing a pattern like `"(a|b)(c|d)E+G?"`, the system parses it into an AST with concatenation at the root, identifies the alternation nodes for `(a|b)` and `(c|d)`, recognizes the repetition operators for `E+` and `G?`, and then generates valid combinations. This approach makes it possible to systematically generate all strings that match a given regex pattern, within practical limits.
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
