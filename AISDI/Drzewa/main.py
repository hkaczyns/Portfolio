from analize import analize
from BST import BST_Tree
from AVL import AVL_Tree
from graph import draw_graph


def main():
    results = [analize(BST_Tree), analize(AVL_Tree)]
    draw_graph(results)


if __name__ == "__main__":
    main()
