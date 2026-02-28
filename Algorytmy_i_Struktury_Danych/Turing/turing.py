def turing_prepare(filename):
    instructions = []
    with open(filename, "r") as file:
        lines = file.readlines()
        for instruction in lines:
            instruction = instruction.rstrip("\n")
            instructions.append(instruction.split(" "))
    return instructions


def print_turing(tape, index, state):
    print(tape + " " + state)
    pointer = index * " " + "^"
    print(pointer)


def turing_process_normal(tape, filename):
    # Create initial state
    state = "init"
    index = 0
    print_turing(tape, index, state)
    instructions = turing_prepare(filename)

    while state[:4] != "halt":
        for instruction in instructions:
            if instruction[0] == state and instruction[1] == tape[index]:
                # Replace current character with the given
                tape = tape[:index] + instruction[2] + tape[index + 1 :]

                # Move pointer
                if instruction[3] == "R":
                    index += 1
                elif instruction[3] == "L":
                    index -= 1

                # When the pointer points to no-char symbol at
                # the beginning of the tape and the index
                # is incremented, decrement the index to correct
                # its position
                if instruction[2] == "_" and instruction[3] == "R":
                    index -= 1

                state = instruction[4]

                # When index out of range, add a no-char symbol
                if index >= len(tape):
                    tape += "_"
                elif index < 0:
                    tape = "_" + tape
                    index = 0
                # If the pointer is inside the tape,
                # delete no-char symbols on the edges
                else:
                    tape = tape.strip("_")

                # If tape is empty, fill it with no-char symbol
                if len(tape) == 0:
                    tape = "_"
                print_turing(tape, index, state)
                break


def turing_process_special(tape, filename):
    # Create initial state
    state = "init"
    index = 0
    print_turing(tape, index, state)
    instructions = turing_prepare(filename)
    while state[:4] != "halt":

        # Found flag means whether a fitting instruction
        # without * on the <currect_symbol> has been found
        found_flag = 0

        for instruction in instructions:
            if index >= len(tape):
                break
            if instruction[0] == state and instruction[1] == tape[index]:

                # Replace current character with the given
                # (unless the symbol is * - then do not change the symbol)
                if instruction[2] != "*":
                    tape = tape[:index] + instruction[2] + tape[index + 1 :]

                # Move pointer
                if instruction[3] == "R":
                    index += 1
                elif instruction[3] == "L":
                    index -= 1

                # When the pointer points to no-char symbol at
                # the beginning of the tape and the index
                # is incremented, decrement the index to correct
                # its position
                if instruction[2] == "_" and instruction[3] == "R":
                    index -= 1

                state = instruction[4]

                # When index out of range, add a no-char symbol
                if index >= len(tape):
                    tape += "_"
                elif index < 0:
                    tape = "_" + tape
                    index = 0
                # If the pointer is inside the tape,
                # delete no-char symbols on the edges
                else:
                    tape = tape.strip("_")

                # If tape is empty, fill it with no-char symbol
                if len(tape) == 0:
                    tape = "_"
                print_turing(tape, index, state)

                # Specific instruction has been found
                found_flag = 1
                break

        # If a specific instruction has not been found, start looking for
        # an instruction with *
        if found_flag == 0:
            for instruction in instructions:
                if instruction[0] == state and instruction[1] == "*":
                    if instruction[2] != "*":
                        if index < 0:
                            tape = instruction[2] + tape
                        elif index >= len(tape):
                            tape = tape + instruction[2]
                        else:
                            tape = (
                                tape[:index]
                                + instruction[2]
                                + tape[index + 1 :]
                            )

                    if instruction[3] == "R":
                        index += 1
                    elif instruction[3] == "L":
                        index -= 1

                    if instruction[2] == "_" and instruction[3] == "R":
                        index -= 1

                    state = instruction[4]

                    if index >= len(tape):
                        tape += "_"
                    elif index < 0:
                        tape = "_" + tape
                        index = 0
                    else:
                        tape = tape.strip("_")

                    if len(tape) == 0:
                        tape = "_"
                    print_turing(tape, index, state)
                    found_flag = 0
                    break
