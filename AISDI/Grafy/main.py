import sys
from graph import Graph


def main(*argv):
    if len(argv[0]) != 2:
        print("To run the program, use:\npython3 main.py <path>")
    else:
        new_graph = Graph(argv[0][1])
        new_graph.print_path()


if __name__ == "__main__":
    main(sys.argv)
