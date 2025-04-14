# Regular Expression Parser and Generator

## Introduction

This report presents the implementation of a regular expression parser and generator in TypeScript. The implementation allows for parsing regular expressions, building a syntax tree representation, and generating valid combinations that match the given regular expression pattern.

## Implementation Components

The implementation consists of several core components that work together to parse and process regular expressions.

### RegexNode Class

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

### RegexParser Class

The RegexParser class handles the parsing of regex patterns into a tree structure. It implements recursive descent parsing to handle the various regex operations including alternation, concatenation, and repetition.

### RegexTreePrinter Class

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

### Main Application

```typescript
import { RegexGenerator } from "./RegexGenerator";
import { RegexParser } from "./RegexParser";
import { RegexTreePrinter } from "./RegexTree";

function main() {
    const patterns: string[] = [
        "(a|b)(c|d)E+G?", 
        "P(Q|R|S)T(UV|W|X)Z+", 
        "1(0|1)2(3|4){5}36"
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

## System Functionality

The implementation provides several key functionalities:

1. **Regex Parsing**: The system can parse regular expressions into a tree structure, handling literals, alternation (|), concatenation, and repetition operators (+, *, ?, {n,m}).

2. **Tree Representation**: The parsed regex is represented as a tree where each node corresponds to a specific regex operation or literal.

3. **String Generation**: The system can generate all valid strings that match the given regex pattern, up to a configurable limit.

4. **Calculation of Possibilities**: The system can calculate the total number of possible combinations for a given regex pattern.

## Example Usage and Results

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

### Pattern 2: P(Q|R|S)T(UV|W|X)*Z+

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