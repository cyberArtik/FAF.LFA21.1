class ASTNode:
    def __init__(self, node_type, value):
        self.node_type = node_type
        self.value = value
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def print(self, prefix="", is_tail=True):
        readable_value = str(self.value)

        # Beautify token types
        token_map = {
            'PLUS': '+',
            'MINUS': '-',
            'MULTIPLY': '*',
            'DIVIDE': '/',
            'POWER': '^',
            'SIN': 'sin',
            'COS': 'cos',
            'TAN': 'tan'
        }

        if str(self.value) in token_map:
            readable_value = token_map[str(self.value)]

        # Use different colors for different node types
        colors = {
            'NUMBER': '\033[94m',  # Blue for numbers
            'OPERATION': '\033[91m',  # Red for operations
            'FUNCTION': '\033[92m',  # Green for functions
            'PARENTHESIS': '\033[93m',  # Yellow for parentheses
            'VARIABLE': '\033[95m',  # Magenta for variables
        }

        # Default color (white)
        color = colors.get(self.node_type, '\033[97m')
        reset = '\033[0m'  # Reset color

        # Pretty print the node
        print(f"{prefix}{'└── ' if is_tail else '├── '}{color}{self.node_type}{reset}: {color}{readable_value}{reset}")

        # Print children
        for i in range(len(self.children)):
            self.children[i].print(prefix + ('    ' if is_tail else '│   '), i == len(self.children) - 1)
