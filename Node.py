# Define NodeType Enum
class NodeType:
    NUMBER = 'NUMBER'
    FUNCTION = 'FUNCTION'
    OPERATION = 'OPERATION'
    VARIABLE = 'VARIABLE'  # For handling variables like x, y, etc.
    UNARY_OPERATION = 'UNARY_OPERATION'  # For unary operations like -x, sin(x)
    BINARY_OPERATION = 'BINARY_OPERATION'  # For binary operations like x + y, x * y
    COMPARISON = 'COMPARISON'  # For comparison nodes, like x < y, a == b
    LOGICAL_OPERATION = 'LOGICAL_OPERATION'  # For logical operations like AND, OR, NOT
    PARENTHESIS = 'PARENTHESIS'  # For capturing parentheses in the expression
    FUNCTION_CALL = 'FUNCTION_CALL'  # For function calls like sin(x), log(x)
    CONSTANT = 'CONSTANT'  # For constant values (like π, e, etc.)
