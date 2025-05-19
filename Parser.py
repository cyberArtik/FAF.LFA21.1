from ASTNode import ASTNode
from Node import NodeType
from Token import Token, TokenType


# Parser class to parse the tokens into an AST
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.position = 0

    def get_current_token(self):
        return self.tokens[self.position] if self.position < len(self.tokens) else Token(TokenType.EOL, "")

    def advance(self):
        self.position += 1

    def parse(self):
        return self.parse_expression()

    def parse_expression(self):
        node = self.parse_term()
        while self.get_current_token().token_type in [TokenType.PLUS, TokenType.MINUS]:
            op = self.get_current_token()
            self.advance()
            right = self.parse_term()
            op_node = ASTNode(NodeType.OPERATION, op.token_type)
            op_node.add_child(node)
            op_node.add_child(right)
            node = op_node
        return node

    def parse_term(self):
        node = self.parse_factor()
        while self.get_current_token().token_type in [TokenType.MULTIPLY, TokenType.DIVIDE]:
            op = self.get_current_token()
            self.advance()
            right = self.parse_factor()
            op_node = ASTNode(NodeType.OPERATION, op.token_type)
            op_node.add_child(node)
            op_node.add_child(right)
            node = op_node
        return node

    def parse_factor(self):
        token = self.get_current_token()
        if token.token_type == TokenType.NUMBER:
            self.advance()
            return ASTNode(NodeType.NUMBER, token.value)
        elif token.token_type in [TokenType.SIN, TokenType.COS, TokenType.TAN]:
            self.advance()
            self.expect(TokenType.LPAREN)
            argument = self.parse_expression()
            self.expect(TokenType.RPAREN)
            func_node = ASTNode(NodeType.FUNCTION, token.token_type)
            func_node.add_child(argument)
            return func_node
        elif token.token_type == TokenType.LPAREN:
            self.advance()
            node = self.parse_expression()
            self.expect(TokenType.RPAREN)
            return node
        else:
            raise RuntimeError(f"Unexpected token: {token.value}")

    def expect(self, token_type):
        if self.get_current_token().token_type == token_type:
            self.advance()
        else:
            raise RuntimeError(f"Expected {token_type} but got {self.get_current_token().token_type}")
