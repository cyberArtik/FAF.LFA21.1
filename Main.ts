import { Tokenizer } from './Tokenizer';
import { TokenType } from './TokenType';
import * as fs from 'fs';
import * as path from 'path';

function formatToken(token: { type: TokenType; value: string; line?: number; column?: number }): string {
    const position = token.line !== undefined && token.column !== undefined 
        ? `[${token.line}:${token.column}]` 
        : '';
    return `${position} ${token.type}: '${token.value.replace(/\n/g, '\\n')}'`;
}

function tokenizeFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const filename = path.basename(filePath);
        
        console.log(`\nProcessing file: ${filename}`);
        console.log('='.repeat(50));
        
        const tokenizer = new Tokenizer(content);
        const tokens = tokenizer.tokenize();
        
        tokens.forEach(token => {
            console.log(formatToken(token));
        });
        
        console.log('\nSummary:');
        console.log(`Total tokens: ${tokens.length}`);
        
        const counts = new Map<string, number>();
        tokens.forEach(token => {
            counts.set(token.type, (counts.get(token.type) || 0) + 1);
        });
        
        for (const [type, count] of counts.entries()) {
            console.log(`${type}: ${count}`);
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

function main(): void {
    const args = process.argv.slice(2);
    const testsDir = path.join(__dirname, './', 'TestsInputs');
    
    if (args.length === 0) {
        console.log('Testing with all pixili files in tests/inputs directory...');
        
        try {
            const files = fs.readdirSync(testsDir)
                .filter(file => file.endsWith('.pixili'))
                .map(file => path.join(testsDir, file));
            
            if (files.length === 0) {
                console.log('No .pixili files found in tests/inputs directory.');
                return;
            }
            
            files.forEach(file => {
                tokenizeFile(file);
            });
        } catch (error) {
            console.error('Error reading test directory:', error);
        }
    } else {
        args.forEach(arg => {
            const filePath = path.isAbsolute(arg) ? arg : path.join(testsDir, arg);
            
            if (fs.existsSync(filePath)) {
                tokenizeFile(filePath);
            } else {
                console.error(`File not found: ${filePath}`);
            }
        });
    }
}

main();
