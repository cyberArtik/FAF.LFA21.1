from Grammar import *
from collections import deque


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

class FiniteAutomata2(FiniteAutomata):
    def __init__(self, **args):
        super().__init__(**args)

    def finiteAutomatonToGrammar(self):
        Vn = self.alphabet
        Vt = self.states
        S = self.startState
        P = {}

        for key, values in self.transitions.items():
            for value in values:
                if key[0] not in P.keys():
                    P[key[0]] = [key[1] + value]
                else:
                    P[key[0]].append(key[1] + value)
                if value in self.finalStates:
                    P[key[0]].append(key[1])

        return Grammar2(
            Vn=Vn,
            Vt=Vt,
            S=S,
            P=P,
        )

    def isDetermenistic(self):
        for state in self.states:
            for symbol in self.alphabet:
                if isinstance(state, frozenset):
                    if (state, symbol) not in self.transitions:
                        continue  # Missing transitions are allowed
                    if len(self.transitions[(state, symbol)]) != 1:
                        return False
                else:
                    if (state, symbol) not in self.transitions:
                        continue  # Missing transitions are allowed
                    if len(self.transitions[(state, symbol)]) > 1:
                        return False
        return True

    def _string_to_state_set(self, state_string):
        """Convert a string representation back to a set of states"""
        if state_string == "DFA_EMPTY":
            return set()
        return set(state_string[4:].split("_"))  # Remove "DFA_" prefix and split

    def NfaToDfa(self):
        # Dictionary to store epsilon closures for each state
        epsilon_closure = {}
        for state in self.states:
            epsilon_closure[state] = self.getEpsilonClosure(state)

        # First state of DFA will be epsilon closure of start state of NFA
        start_state_set = epsilon_closure[self.startState]
        start_state_str = self._state_set_to_string(start_state_set)

        # Lists to track states to process and already processed states
        dfa_stack = [start_state_set]
        dfa_states = [start_state_set]
        dfa_states_str = {start_state_str}

        # Create output components for DFA
        dfa_transitions = {}
        dfa_final_states = set()

        # Check if start state is final
        if any(state in self.finalStates for state in start_state_set):
            dfa_final_states.add(start_state_str)

        # Process all states in the stack
        while dfa_stack:
            current_state_set = dfa_stack.pop(0)
            current_state_str = self._state_set_to_string(current_state_set)

            # Process each alphabet symbol (excluding epsilon if present)
            for symbol in self.alphabet:
                # Skip epsilon transitions in the main loop as they're handled via epsilon closure
                if symbol == 'e':
                    continue

                # Compute the next state set for this symbol
                next_state_set = set()

                # For each state in current set, find transitions and apply epsilon closure
                for state in current_state_set:
                    if (state, symbol) in self.transitions:
                        # Get direct transitions
                        direct_states = self.transitions[(state, symbol)]

                        # For each direct state, add its epsilon closure
                        for direct_state in direct_states:
                            if direct_state in epsilon_closure:
                                next_state_set.update(epsilon_closure[direct_state])
                            else:
                                next_state_set.add(direct_state)

                # Convert to string representation
                next_state_str = self._state_set_to_string(next_state_set)

                # Add transition
                dfa_transitions[(current_state_str, symbol)] = {next_state_str}

                # If this is a new state, add it to be processed
                if next_state_str not in dfa_states_str and next_state_set:
                    dfa_stack.append(next_state_set)
                    dfa_states.append(next_state_set)
                    dfa_states_str.add(next_state_str)

                    # Check if it's a final state
                    if any(state in self.finalStates for state in next_state_set):
                        dfa_final_states.add(next_state_str)

                # Handle empty set case (dead state)
                if not next_state_set:
                    dead_state = self._state_set_to_string(set())
                    dfa_transitions[(current_state_str, symbol)] = {dead_state}

                    # Add dead state if not already present
                    if dead_state not in dfa_states_str:
                        dfa_states_str.add(dead_state)

                        # Add transitions from dead state to itself for all symbols
                        for alpha in self.alphabet:
                            if alpha != 'e':  # Skip epsilon
                                dfa_transitions[(dead_state, alpha)] = {dead_state}

        # Convert state sets to string representation for the final DFA
        dfa_states_final = dfa_states_str

        # Create and return the DFA
        return FiniteAutomata2(
            states=dfa_states_final,
            alphabet=[a for a in self.alphabet if a != 'e'],  # Exclude epsilon
            transitions=dfa_transitions,
            startState=start_state_str,
            finalStates=dfa_final_states
        )

    def getEpsilonClosure(self, state):
        """
        Compute the epsilon closure of a state (all states reachable via epsilon transitions)
        """
        closure = set([state])
        stack = [state]

        while stack:
            current = stack.pop(0)

            # If there are epsilon transitions from current state
            if (current, 'e') in self.transitions:
                for next_state in self.transitions[(current, 'e')]:
                    if next_state not in closure:
                        closure.add(next_state)
                        stack.append(next_state)

        return closure

    def _state_set_to_string(self, state_set):
        """Convert a set of states to a string representation"""
        if not state_set:
            return "DFA_EMPTY"
        sorted_states = sorted(list(state_set))
        return "DFA_" + "_".join(str(state) for state in sorted_states)