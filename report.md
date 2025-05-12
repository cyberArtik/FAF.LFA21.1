# Topic: Chomsky Normal Form
****
### Course: Formal Languages & Finite Automata
## Author: Ilico Artemie
----
## Theory
A **Context-Free Grammar (CFG)** is a formal grammar consisting of a set of production rules that describe all possible strings in a given formal language. CFGs are important in both theoretical computer science and natural language processing.

A context-free grammar G is defined by a 4-tuple G = (V, Σ, R, S) where:
- V is a finite set of non-terminal symbols
- Σ is a finite set of terminal symbols (disjoint from V)
- R is a finite set of production rules of the form A → α, where A ∈ V and α ∈ (V ∪ Σ)*
- S ∈ V is the start symbol

**Chomsky Normal Form (CNF)** is a simplified form of context-free grammar where all production rules are of the following forms:
1. A → BC, where A, B, and C are non-terminal symbols (B and C cannot be the start symbol)
2. A → a, where A is a non-terminal symbol and a is a terminal symbol
3. S → ε (only if S is the start symbol and S does not appear on the right side of any rule)

The algorithm to convert a CFG to CNF involves several steps:
1. Start Symbol Isolation
2. Eliminate ε-productions
3. Eliminate Unit Productions
4. Remove Inaccessible Symbols
5. Remove Non-productive Symbols
6. Convert Long Productions
7. Handle Terminal-Nonterminal Combinations

## Objectives
1. Learn about Chomsky Normal Form (CNF)
2. Get familiar with the approaches of normalizing a grammar
3. Implement a method for normalizing an input grammar by the rules of CNF
    The implementation needs to be encapsulated in a method with an appropriate signature
    The implemented functionality needs to be executed and tested

## Implementation Description

### Grammar Class
I've implemented a Grammar class in TypeScript to represent and manipulate context-free grammars:

```typescript
export class Grammar {
    VN: Set<string>; 
    VT: Set<string>;
    P: Map<string, string[]>; 
    S: string; 

    constructor(vN: Set<string>, vT: Set<string>, p: Map<string, string[]>, s: string) {
        this.VN = vN;
        this.VT = vT;
        this.P = p;
        this.S = s;
    }

    toString(): string {
        let vNData = "V_n = {" + Array.from(this.VN).join(", ") + "}\n";
        let vTData = "V_t = {" + Array.from(this.VT).join(", ") + "}\n";
        let pData = "P = {\n";
        
        this.P.forEach((value, key) => {
            pData += "\t" + key + " ---> " + value.join(" | ") + "\n";
        });
        
        pData += "}\n";
        let sData = "S = " + this.S + "\n";
        
        return `${vNData}${vTData}${pData}${sData}`;
    }
}
```

### ChomskyNormalForm Implementation
The core implementation for converting a grammar to CNF is encapsulated in the `ChomskyNormalForm` class:

```typescript
import { Grammar } from "./Grammar";

export class ChomskyNormalForm {
    static obtain(grammar: Grammar): void {
        // 1. Add a new start symbol if needed
        this.addNewStartSymbol(grammar);
        console.log("Grammar after adding a new start symbol:");
        console.log(grammar.toString());

        // 2. Eliminate ε-productions
        this.eliminateEmptyProductions(grammar);
        console.log("Grammar after eliminating empty productions:");
        console.log(grammar.toString());

        // 3. Eliminate unit rules
        this.eliminateUnitRules(grammar);
        console.log("Grammar after eliminating unit rules:");
        console.log(grammar.toString());

        // 4. Eliminate inaccessible symbols
        this.eliminateInaccessibleSymbols(grammar);
        console.log("Grammar after eliminating inaccessible symbols:");
        console.log(grammar.toString());

        // 5. Eliminate non-productive symbols
        this.eliminateNonProductiveSymbols(grammar);
        console.log("Grammar after eliminating non-productive symbols:");
        console.log(grammar.toString());

        // 6. Convert to CNF format
        this.convertToCNFFormat(grammar);
    }
```

### Main Program
The main program where I set up my grammar for Variant 17 and run the conversion process:

```typescript
// Main.ts
import { ChomskyNormalForm } from "./ChomskyNormalForm";
import { Grammar } from "./Grammar";

// Initialize grammar for Variant 17
const grammar = new Grammar(
    new Set<string>(["S", "A", "B", "C", "D", "E"]),
    new Set<string>(["a", "b"]),
    new Map<string, string[]>([
        ["S", ["aA", "AC"]],
        ["A", ["a", "ASC", "BC", "aD"]],
        ["B", ["b", "bA"]],
        ["C", ["ε", "BA"]],
        ["D", ["abC"]],
        ["E", ["aB"]]
    ]),
    "S"
);

console.log("Grammar before modifications:");
console.log(grammar.toString());

ChomskyNormalForm.obtain(grammar);

console.log("Grammar after bringing it to CNF:");
console.log(grammar.toString());
```

## Implementation Details

The Chomsky Normal Form conversion is performed in several distinct steps:

1. **Add New Start Symbol**: If the original start symbol appears on any right-hand side of production rules, we create a new start symbol and add a production from it to the original start symbol. This ensures that the start symbol never appears on the right side of any production.

2. **Eliminate Empty Productions**: We identify all nullable variables (those that can derive the empty string) and then modify the productions to account for all possible combinations where these nullable variables might be absent.

3. **Eliminate Unit Rules**: We compute the transitive closure of unit productions to identify all possible unit derivations. Then we replace unit productions with their non-unit alternatives, maintaining the language generated by the grammar.

4. **Eliminate Inaccessible Symbols**: We find all symbols that can be reached from the start symbol and remove any that cannot be reached, along with their associated productions.

5. **Eliminate Non-Productive Symbols**: We identify symbols that cannot derive any string of terminals and remove them from the grammar, along with any productions that use them.

6. **Convert to CNF Format**: We replace terminals in mixed productions with new non-terminals and break down productions with more than two symbols on the right-hand side into binary productions.

## Results

The output of running the program with my Variant 17 grammar shows the step-by-step transformation:

```
Grammar before modifications:
V_n = {S, A, B, C, D, E}
V_t = {a, b}
P = {
        S ---> aA | AC
        A ---> a | ASC | BC | aD
        B ---> b | bA
        C ---> ε | BA
        D ---> abC
        E ---> aB
}
S = S

Grammar after adding a new start symbol:
V_n = {S, A, B, C, D, E, G}
V_t = {a, b}
P = {
        S ---> aA | AC
        A ---> a | ASC | BC | aD
        B ---> b | bA
        C ---> ε | BA
        D ---> abC
        E ---> aB
        G ---> S
}
S = G

Grammar after eliminating empty productions:
V_n = {S, A, B, C, D, E, G}
V_t = {a, b}
P = {
        S ---> aA | AC | A
        A ---> a | ASC | AS | BC | B | aD
        B ---> b | bA
        C ---> BA
        D ---> abC | ab
        E ---> aB
        G ---> S
}
S = G

Grammar after eliminating unit rules:
V_n = {S, A, B, C, D, E, G}
V_t = {a, b}
P = {
        S ---> aA | AC | a | ASC | AS | BC | aD | b | bA
        A ---> a | ASC | AS | BC | aD | b | bA
        B ---> b | bA
        C ---> BA
        D ---> abC | ab
        E ---> aB
        G ---> aA | AC | a | ASC | AS | BC | aD | b | bA
}
S = G

Grammar after eliminating inaccessible symbols:
V_n = {S, A, B, C, D, G}
V_t = {a, b}
P = {
        S ---> aA | AC | a | ASC | AS | BC | aD | b | bA
        A ---> a | ASC | AS | BC | aD | b | bA
        B ---> b | bA
        C ---> BA
        D ---> abC | ab
        G ---> aA | AC | a | ASC | AS | BC | aD | b | bA
}
S = G

Grammar after eliminating non-productive symbols:
V_n = {S, A, B, C, D, G}
V_t = {a, b}
P = {
        S ---> aA | AC | a | ASC | AS | BC | aD | b | bA
        A ---> a | ASC | AS | BC | aD | b | bA
        B ---> b | bA
        C ---> BA
        D ---> abC | ab
        G ---> aA | AC | a | ASC | AS | BC | aD | b | bA
}
S = G

Grammar after bringing it to CNF:
V_n = {S, A, B, C, D, G, H, I, J, K}
V_t = {a, b}
P = {
        S ---> HA | AC | a | AJ | AS | BC | HD | b | IA
        J ---> SC
        H ---> a
        I ---> b
        A ---> a | AJ | AS | BC | HD | b | IA
        B ---> b | IA
        C ---> BA
        D ---> HK | HI
        K ---> IC
        G ---> HA | AC | a | AJ | AS | BC | HD | b | IA
}
S = G
```

## Conclusion

In this laboratory work, I successfully implemented a complete algorithm for converting a context-free grammar to Chomsky Normal Form. The implementation follows the standard transformation steps and handles all the complexities involved in the process.

The transformation is broken down into distinct phases, making the code more modular and easier to understand. Each phase implements a specific aspect of the CNF conversion, and the output at each step helps verify the correctness of the transformation.

The final grammar satisfies all the requirements of Chomsky Normal Form:
 Each production is of the form A → BC (two non-terminals) or A → a (one terminal)
 No epsilon productions (except potentially for the start symbol)
 No unit productions (A → B where B is a non-terminal)

This implementation can be used to convert any valid context-free grammar to Chomsky Normal Form, which is particularly useful for applications like the CYK parsing algorithm that requires grammars in CNF.

By displaying the grammar at each transformation stage, the implementation also serves as an educational tool for understanding how the CNF conversion process works in practice.
