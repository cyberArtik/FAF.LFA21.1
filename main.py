from Lexer import Lexer
from Parser import Parser
import sys


def main():
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
    else:
        input_text = input("Enter mathematical expression: ")

    lexer = Lexer(input_text)
    tokens = lexer.tokenize()

    print("\nTokenized expression:")
    for token in tokens:
        if token.token_type != 'EOL':  # Skip the EOL token in output
            print(f"  {token}")

    parser = Parser(tokens)

    try:
        print("\nAbstract Syntax Tree:")
        ast = parser.parse()
        ast.print()

    except RuntimeError as e:
        print("Invalid expression:", e)


if __name__ == "__main__":
    main()
