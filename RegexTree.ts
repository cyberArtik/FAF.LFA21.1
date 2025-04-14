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