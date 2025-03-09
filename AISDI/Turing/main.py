import sys
from turing import turing_process_normal, turing_process_special


def main(*argv):
    if len(argv[0]) != 3 and len(argv[0]) != 4:
        print("To run the program, use:\npython3 main.py <tape> <path> <mode>")
    else:
        tape, path = argv[0][1], argv[0][2]
        if len(argv[0]) == 3:
            turing_process_normal(tape, path)
        else:
            mode = argv[0][3]
            if mode == "special":
                turing_process_special(tape, path)
            else:
                turing_process_normal(tape, path)


if __name__ == "__main__":
    main(sys.argv)
