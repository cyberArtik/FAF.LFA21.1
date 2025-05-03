import { Grammar } from "./Grammar";

export class ChomskyNormalForm {
    private static getNextAvailableLetter(grammar: Grammar): string {
        let letter = 'G';
        while (grammar.VN.has(letter)) {
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
        }
        return letter;
    }

    private static eliminateEmptyProductions(grammar: Grammar): void {
        const nullableVariables = new Set<string>();
        
        grammar.P.forEach((productions, nonTerminal) => {
            if (productions.includes("ε")) {
                nullableVariables.add(nonTerminal);
            }
        });
        
        let changed: boolean;
        do {
            changed = false;
            
            grammar.P.forEach((productions, nonTerminal) => {
                if (!nullableVariables.has(nonTerminal)) {
                    for (const rhs of productions) {
                        let allNullable = true;
                        
                        for (let i = 0; i < rhs.length; i++) {
                            const symbol = rhs[i];
                            
                            if (!nullableVariables.has(symbol) || grammar.VT.has(symbol)) {
                                allNullable = false;
                                break;
                            }
                        }
                        
                        if (allNullable && rhs.length > 0) {
                            nullableVariables.add(nonTerminal);
                            changed = true;
                            break;
                        }
                    }
                }
            });
        } while (changed);
        
        const newP = new Map<string, string[]>();
        
        grammar.P.forEach((productions, nonTerminal) => {
            newP.set(nonTerminal, []);
            
            for (const rhs of productions) {
                if (rhs !== "ε") {
                    newP.get(nonTerminal)!.push(rhs);
                    
                    const nullablePositions: number[] = [];
                    for (let i = 0; i < rhs.length; i++) {
                        if (nullableVariables.has(rhs[i])) {
                            nullablePositions.push(i);
                        }
                    }
                    
                    const subsets = 1 << nullablePositions.length; 
                    for (let i = 1; i < subsets; i++) { 
                        let newRhs = rhs;
                        
                        for (let j = nullablePositions.length - 1; j >= 0; j--) {
                            if ((i & (1 << j)) !== 0) {
                                newRhs = newRhs.substring(0, nullablePositions[j]) + newRhs.substring(nullablePositions[j] + 1);
                            }
                        }
                        
                        if (newRhs.length > 0 && !newP.get(nonTerminal)!.includes(newRhs)) {
                            newP.get(nonTerminal)!.push(newRhs);
                        }
                    }
                }
            }
        });
        
        grammar.P = newP;
    }

    private static eliminateAnyUnitRules(grammar: Grammar): void {
        const unitDerivations = new Map<string, Set<string>>();
        
        grammar.VN.forEach(nonTerminal => {
            unitDerivations.set(nonTerminal, new Set([nonTerminal]));
        });
        
        let changed: boolean;
        do {
            changed = false;
            
            grammar.P.forEach((productions, lhs) => {
                for (const rhs of productions) {
                    if (rhs.length === 1 && grammar.VN.has(rhs)) {
                        const derivedSet = unitDerivations.get(rhs)!;
                        const lhsSet = unitDerivations.get(lhs)!;
                        
                        for (const derived of derivedSet) {
                            if (!lhsSet.has(derived)) {
                                lhsSet.add(derived);
                                changed = true;
                            }
                        }
                    }
                }
            });
        } while (changed);
        
        const newP = new Map<string, string[]>();
        
        grammar.VN.forEach(lhs => {
            newP.set(lhs, []);
            
            const derivedNTs = unitDerivations.get(lhs)!;
            derivedNTs.forEach(derivedNT => {
                const productions = grammar.P.get(derivedNT) || [];
                
                for (const rhs of productions) {
                    if (!(rhs.length === 1 && grammar.VN.has(rhs))) {
                        if (!newP.get(lhs)!.includes(rhs)) {
                            newP.get(lhs)!.push(rhs);
                        }
                    }
                }
            });
        });
        
        grammar.P = newP;
    }

    private static eliminateInaccessibleSymbols(grammar: Grammar): void {
        const accessibleSymbols = new Set<string>([grammar.S]);
        
        let changed: boolean;
        do {
            changed = false;
            
            grammar.P.forEach((productions, lhs) => {
                if (accessibleSymbols.has(lhs)) {
                    for (const rhs of productions) {
                        for (let i = 0; i < rhs.length; i++) {
                            const symbol = rhs[i];
                            
                            if (grammar.VN.has(symbol) && !accessibleSymbols.has(symbol)) {
                                accessibleSymbols.add(symbol);
                                changed = true;
                            }
                        }
                    }
                }
            });
        } while (changed);
        
        const inaccessibleSymbols = new Set<string>();
        grammar.VN.forEach(symbol => {
            if (!accessibleSymbols.has(symbol)) {
                inaccessibleSymbols.add(symbol);
            }
        });
        
        inaccessibleSymbols.forEach(symbol => {
            grammar.VN.delete(symbol);
            grammar.P.delete(symbol);
        });
    }

    private static eliminateNonProductiveSymbols(grammar: Grammar): void {
        const productiveSymbols = new Set<string>();
        
        grammar.P.forEach((productions, nonTerminal) => {
            for (const rhs of productions) {
                let allTerminals = true;
                
                for (let i = 0; i < rhs.length; i++) {
                    if (!grammar.VT.has(rhs[i])) {
                        allTerminals = false;
                        break;
                    }
                }
                
                if (allTerminals) {
                    productiveSymbols.add(nonTerminal);
                    break;
                }
            }
        });
        
        let changed: boolean;
        do {
            changed = false;
            
            grammar.P.forEach((productions, lhs) => {
                if (!productiveSymbols.has(lhs)) {
                    for (const rhs of productions) {
                        let allProductive = true;
                        
                        for (let i = 0; i < rhs.length; i++) {
                            const symbol = rhs[i];
                            
                            if (grammar.VN.has(symbol) && !productiveSymbols.has(symbol)) {
                                allProductive = false;
                                break;
                            }
                        }
                        
                        if (allProductive) {
                            productiveSymbols.add(lhs);
                            changed = true;
                            break;
                        }
                    }
                }
            });
        } while (changed);
        
        const nonProductiveSymbols = new Set<string>();
        grammar.VN.forEach(symbol => {
            if (!productiveSymbols.has(symbol)) {
                nonProductiveSymbols.add(symbol);
            }
        });
        
        nonProductiveSymbols.forEach(symbol => {
            grammar.VN.delete(symbol);
            grammar.P.delete(symbol);
        });
        
        const newP = new Map<string, string[]>();
        
        grammar.P.forEach((productions, nonTerminal) => {
            newP.set(nonTerminal, []);
            
            for (const rhs of productions) {
                let containsNonProductive = false;
                
                for (let i = 0; i < rhs.length; i++) {
                    const symbol = rhs[i];
                    
                    if (grammar.VN.has(symbol) && nonProductiveSymbols.has(symbol)) {
                        containsNonProductive = true;
                        break;
                    }
                }
                
                if (!containsNonProductive) {
                    newP.get(nonTerminal)!.push(rhs);
                }
            }
        });
        
        grammar.P = newP;
    }

    public static obtain(grammar: Grammar): void {
        let needNewStartSymbol = false;
        
        grammar.P.forEach((productions, _) => {
            for (const rhs of productions) {
                if (rhs.includes(grammar.S)) {
                    needNewStartSymbol = true;
                    break;
                }
            }
        });
        
        if (needNewStartSymbol) {
            const newStartSymbol = this.getNextAvailableLetter(grammar);
            grammar.VN.add(newStartSymbol);
            grammar.P.set(newStartSymbol, [grammar.S]);
            grammar.S = newStartSymbol;
        }
        
        console.log("\nGrammar after adding a new start symbol:");
        console.log(grammar.toString());

        this.eliminateEmptyProductions(grammar);
        console.log("\nGrammar after eliminating empty productions:");
        console.log(grammar.toString());

        this.eliminateAnyUnitRules(grammar);
        console.log("\nGrammar after eliminating unit rules:");
        console.log(grammar.toString());

        this.eliminateInaccessibleSymbols(grammar);
        console.log("\nGrammar after eliminating inaccessible symbols:");
        console.log(grammar.toString());

        this.eliminateNonProductiveSymbols(grammar);
        console.log("\nGrammar after eliminating non-productive symbols:");
        console.log(grammar.toString());

        const terminalToNonTerminal = new Map<string, string>();
        const newP = new Map<string, string[]>();
        
        grammar.P.forEach((productions, lhs) => {
            newP.set(lhs, []);
            
            for (const rhs of productions) {
                let newRhs = "";
                
                for (let i = 0; i < rhs.length; i++) {
                    const c = rhs[i];
                    
                    if (grammar.VT.has(c) && (rhs.length > 1)) {
                        if (!terminalToNonTerminal.has(c)) {
                            const newNonTerminal = this.getNextAvailableLetter(grammar);
                            grammar.VN.add(newNonTerminal);
                            
                            if (!newP.has(newNonTerminal)) {
                                newP.set(newNonTerminal, []);
                            }
                            
                            newP.get(newNonTerminal)!.push(c);
                            terminalToNonTerminal.set(c, newNonTerminal);
                        }
                        
                        newRhs += terminalToNonTerminal.get(c);
                    } else {
                        newRhs += c;
                    }
                }
                
                newP.get(lhs)!.push(newRhs);
            }
        });
        
        grammar.P = newP;
        const rhsToNonTerminal = new Map<string, string>();
        
        const binaryP = new Map<string, string[]>();
        
        grammar.P.forEach((productions, lhs) => {
            binaryP.set(lhs, []);
            
            for (const rhs of productions) {
                if (rhs.length > 2) {
                    let currentLhs = lhs;
                    let remainingRhs = rhs;
                    
                    while (remainingRhs.length > 2) {
                        const firstSymbol = remainingRhs[0];
                        const restOfRhs = remainingRhs.substring(1);
                        
                        let newNonTerminal: string;
                        if (rhsToNonTerminal.has(restOfRhs)) {
                            newNonTerminal = rhsToNonTerminal.get(restOfRhs)!;
                        } else {
                            newNonTerminal = this.getNextAvailableLetter(grammar);
                            grammar.VN.add(newNonTerminal);
                            rhsToNonTerminal.set(restOfRhs, newNonTerminal);
                            
                            if (!binaryP.has(newNonTerminal)) {
                                binaryP.set(newNonTerminal, []);
                            }
                        }
                        
                        binaryP.get(currentLhs)!.push(firstSymbol + newNonTerminal);
                        
                        currentLhs = newNonTerminal;
                        remainingRhs = remainingRhs.substring(1);
                        
                        if (!binaryP.has(currentLhs) && !grammar.P.has(currentLhs)) {
                            binaryP.set(currentLhs, []);
                        }
                    }
                    
                    if (!binaryP.get(currentLhs)!.includes(remainingRhs)) {
                        binaryP.get(currentLhs)!.push(remainingRhs);
                    }
                } else {
                    binaryP.get(lhs)!.push(rhs);
                }
            }
        });
        
        rhsToNonTerminal.forEach((nonTerminal) => {
            if (grammar.P.has(nonTerminal) && !binaryP.has(nonTerminal)) {
                binaryP.set(nonTerminal, grammar.P.get(nonTerminal)!.slice());
            }
        });
        
        grammar.P = binaryP;
        
        const finalP = new Map<string, string[]>();
        const productionToNonTerminal = new Map<string, string>();
        
        grammar.P.forEach((productions, lhs) => {
            if (!finalP.has(lhs)) {
                finalP.set(lhs, []);
            }
            
            for (const rhs of productions) {
                if (rhs.length === 2) {
                    if (productionToNonTerminal.has(rhs)) {
                        if (!finalP.get(lhs)!.includes(rhs)) {
                            finalP.get(lhs)!.push(rhs);
                        }
                    } else {
                        productionToNonTerminal.set(rhs, lhs);
                        if (!finalP.get(lhs)!.includes(rhs)) {
                            finalP.get(lhs)!.push(rhs);
                        }
                    }
                } else {
                    if (!finalP.get(lhs)!.includes(rhs)) {
                        finalP.get(lhs)!.push(rhs);
                    }
                }
            }
        });
        
        grammar.P = finalP;
    }
}
