# Variant 17
# Q = {q0,q1,q2,q3},
# ∑ = {a,b,c},
# F = {q3},
# δ(q0,a) = q0,
# δ(q0,a) = q1,
# δ(q1,b) = q1,
# δ(q2,b) = q3,
# δ(q1,a) = q2,
# δ(q2,a) = q0.

from FiniteAutomata import *
from graphviz import Digraph


def visualize_fa(fa: FiniteAutomata2, title):
    graph = Digraph(comment=title)
    graph.attr(rankdir='LR')

    # Add states
    for state in fa.states:
        if state in fa.finalStates:
            graph.node(str(state), shape='doublecircle')
        else:
            graph.node(str(state), shape='circle')

    graph.node('start', shape='none', label='')
    graph.edge('start', str(fa.startState))

    for fromState, transitions in fa.transitions.items():
        for toStates in transitions:
            if isinstance(toStates, str):
                graph.edge(str(fromState[0]), str(toStates), label=fromState[1])
            else:
                for toState in toStates:
                    graph.edge(str(fromState[0]), str(toState), label=fromState[1])

    graph.render(f'{title}.gv', view=True)


def print_separator():
    print("\n" + "=" * 80 + "\n")


print("INITIALIZING ORIGINAL NFA")
states = {"q0", "q1", "q2", "q3"}
alphabet = {"a", "b", "c"}
transitions = {
    ("q0", "a"): ["q0", "q1"],
    ("q1", "b"): ["q1"],
    ("q1", "a"): ["q2"],
    ("q2", "a"): ["q0"],
    ("q2", "b"): ["q3"],
}
startState = "q0"
finalStates = ["q3"]

print(f"States: {states}")
print(f"Alphabet: {alphabet}")
print(f"Transitions:")
for key, value in transitions.items():
    print(f"  δ({key[0]}, {key[1]}) = {value}")
print(f"Start State: {startState}")
print(f"Final States: {finalStates}")

fa = FiniteAutomata2(
    states=states,
    alphabet=alphabet,
    transitions=transitions,
    startState=startState,
    finalStates=finalStates
)
print_separator()

print("CONVERTING NFA TO GRAMMAR:")
gramma = fa.finiteAutomatonToGrammar()
print("\nGrammar Production Rules:")
for state, productions in gramma.P.items():
    print(f"  {state} -> {' | '.join(productions)}")

print("\nExplanation of Grammar Rules:")
for state, productions in gramma.P.items():
    print(f"  State {state}:")
    for prod in productions:
        if len(prod) > 1:
            input_symbol = prod[0]
            target_state = prod[1:]
            print(f"    - When in state {state}, reading '{input_symbol}' leads to state {target_state}")
        else:
            print(f"    - When in state {state}, reading '{prod}' leads to acceptance (final state)")

print("\nGrammar Classification:")
classification = gramma.chomskyTypization()
print(f"  {classification}")
print_separator()

# Check if the FA is deterministic
print("CHECKING IF ORIGINAL AUTOMATON IS DETERMINISTIC:")
is_deterministic = fa.isDetermenistic()
print(f"  Is Deterministic: {is_deterministic}")
if not is_deterministic:
    print("  The automaton is non-deterministic because:")
    for state in fa.states:
        for symbol in fa.alphabet:
            if (state, symbol) in fa.transitions and len(fa.transitions[(state, symbol)]) > 1:
                print(
                    f"    - State {state} has multiple transitions for input '{symbol}': {fa.transitions[(state, symbol)]}")
print_separator()

# Convert NFA to DFA
print("CONVERTING NFA TO DFA:")
dfa = fa.NfaToDfa()

print("\nDFA States:")
for state in dfa.states:
    print(f"  {state}")

print("\nDFA Transitions:")
for key, value in dfa.transitions.items():
    print(f"  δ({key[0]}, {key[1]}) = {value}")

print(f"\nDFA Start State: {dfa.startState}")
print(f"DFA Final States: {dfa.finalStates}")
print_separator()

# Convert DFA to grammar
print("CONVERTING DFA TO GRAMMAR:")
dfa_grammar = dfa.finiteAutomatonToGrammar()

print("\nDFA Grammar Production Rules:")
for state, productions in dfa_grammar.P.items():
    print(f"  {state} -> {' | '.join(productions)}")

print("\nExplanation of DFA Grammar Rules:")
for state, productions in dfa_grammar.P.items():
    description = "Represents "
    if state == "DFA_EMPTY":
        description += "a dead state (no path to acceptance)"
    elif "_" in state:
        description += f"being in multiple states simultaneously: {state[4:].replace('_', ', ')}"
    else:
        description += f"being in state {state[4:]}"

    print(f"  {state} ({description}):")
    for prod in productions:
        if len(prod) > 1:
            input_symbol = prod[0]
            target_state = prod[1:]
            print(f"    - When in this state, reading '{input_symbol}' leads to {target_state}")
        else:
            print(f"    - When in this state, reading '{prod}' leads to acceptance (final state)")
print_separator()

# Check if DFA is deterministic
print("CHECKING IF CONVERTED DFA IS DETERMINISTIC:")
is_dfa_deterministic = dfa.isDetermenistic()
print(f"  Is Deterministic: {is_dfa_deterministic}")
if is_dfa_deterministic:
    print("  As expected, the converted DFA is deterministic")
    print("  This means each state has at most one transition for each input symbol")
print_separator()

print("# visualize_fa(dfa, 'DFA')")
visualize_fa(dfa, 'DFA')