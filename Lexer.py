import re

from Token import Token, TokenType


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
                pass
        tokens.append(Token(TokenType.EOL, ""))  # End Of Line token
        return tokens
