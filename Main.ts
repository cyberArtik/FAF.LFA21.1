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

console.log("\nGrammar before modifications:");
console.log(grammar.toString());

ChomskyNormalForm.obtain(grammar);

console.log("\nGrammar after bringing it to CNF:");
console.log(grammar.toString());

