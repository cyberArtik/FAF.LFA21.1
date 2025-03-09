import random

class FiniteAutomata:
    def __init__(self, **args):
        self.states = args.get("states")
        self.alphabet = args.get("alphabet")
        self.transitions = args.get("transitions")
        self.startState = args.get("startState")
        self.finalStates = args.get("finalStates")

    def stringValidation(self, inp):
        stateTrack = [self.startState]

        for ch in inp:
            if ch not in self.alphabet:
                return False

            nextStates = []
            for state in stateTrack:
                if (state, ch) in self.transitions:
                    nextStates = self.transitions[(state, ch)]

            if not nextStates:
                return False

            stateTrack = nextStates

        return any(state in self.finalStates for state in stateTrack)
class Grammar:

  def __init__(self, **args):
    self.Vn = args.get("Vn")
    self.Vt = args.get("Vt")
    self.P = args.get("P")
    self.S = args.get("S")

  def generateValidString(self):
    current = self.S
    while any(symbol in self.Vn for symbol in current):
      string = ""
      for symbol in current:
        if symbol in self.Vn:
          string += random.choice(self.P[symbol])
        else:
          string += symbol
      current = string
    return current

  def toFiniteAutomata(self):
    states = set(self.Vn)
    alphabet = set(self.Vt)
    startState = self.S
    finalStates = [""]
    transitionFunction = {}

    for nonTerm, res in self.P.items():
      for sequence in res:
        statePos = next((i for i, c in enumerate(sequence) if c in states), -1) # should be also updated to more non-terminals

        key = (
          nonTerm,
          sequence[:statePos] if statePos != -1 else sequence
        )

        value = sequence[statePos] if statePos != -1 else ""

        if key not in transitionFunction:
          transitionFunction[key] = [value]
        elif value not in transitionFunction[key]:
          transitionFunction[key].append(value)

    return FiniteAutomata(
      states = states,
      alphabet = alphabet,
      startState = startState,
      finalStates = finalStates,
      transitions = transitionFunction
    )

class Grammar2(Grammar):
    def __init__(self, **args):
        super().__init__(**args)

    def chomskyTypization(self):
        isType1 = True
        isType2 = True
        isType3Left = True
        isType3Right = True

        hasEmptyProduction = False
        for lhs, rules in self.P.items():
            for rule in rules:
                if rule == "":
                    if lhs != self.S or hasEmptyProduction:
                        isType1 = False
                    hasEmptyProduction = True

        for lhs, rules in self.P.items():
            if len(lhs) != 1 or lhs not in self.Vn:
                isType2 = isType3Right = isType3Left = False

            for rule in rules:
                if rule == "":
                    isType3Right = isType3Left = False
                    continue

                if any(c in self.Vn for c in rule[:-1]):
                    isType3Right = False

                if len(rule) > 1 and (rule[0] not in self.Vn or any(c in self.Vn for c in rule[1:])):
                    isType3Left = False

                if len(rule) < len(lhs) and not (lhs == self.S and rule == ""):
                    isType1 = False

        if isType3Right or isType3Left:
            return "Type 3: Regular Grammar"
        if isType2:
            return "Type 2: Context-Free Grammar"
        if isType1:
            return "Type 1: Context-Sensitive Grammar"
        return "Type 0: Unrestricted Grammar"

    def __str__(self):
        return str(self.P)