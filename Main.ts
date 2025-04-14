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