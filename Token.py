# Define TokenType Enum
class TokenType:
    NUMBER = 'NUMBER'
    FUNCTION = 'FUNCTION'
    OPERATION = 'OPERATION'
    LPAREN = 'LPAREN'
    RPAREN = 'RPAREN'
    PLUS = 'PLUS'
    MINUS = 'MINUS'
    MULTIPLY = 'MULTIPLY'
    DIVIDE = 'DIVIDE'
    POWER = 'POWER'
    SIN = 'SIN'
    COS = 'COS'
    TAN = 'TAN'
    EOL = 'EOL'  # End of Line
    EQUALS = 'EQUALS'  # For comparison '=='
    NEQUALS = 'NEQUALS'  # For comparison '!='
    LESS_THAN = 'LESS_THAN'  # For comparison '<'
    GREATER_THAN = 'GREATER_THAN'  # For comparison '>'
    LESS_THAN_EQUAL = 'LESS_THAN_EQUAL'  # For comparison '<='
    GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL'  # For comparison '>='


# Define Token class
class Token:
    def __init__(self, token_type, value):
        self.token_type = token_type
        self.value = value

    def __repr__(self):
        return f"{self.token_type}({self.value})"
