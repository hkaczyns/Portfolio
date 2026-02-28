from matplotlib import pyplot as plt


def draw_graph(results):
    """
    :param results: A list containing results of timing certain
                    operations on different trees (bst and avl).
                    Results contain:
                    - create
                    - search
                    - delete (just for BST)
    """
    figure, axis = plt.subplots(3, 1, constrained_layout=True)
    figure.set_figheight(12)
    for i in range(2):
        for j in range(3):
            axis[j].plot(results[i][j][1], results[i][j][0])
            axis[j].legend(["BST", "AVL"])
            axis[j].set_xlabel("Number of elements")
            axis[j].set_ylabel("Time to process the operation (s)")
    axis[0].set_title("Time to create")
    axis[1].set_title("Time to search")
    axis[2].set_title("Time to delete")
    axis[2].legend(["BST"])
    plt.savefig("Drzewa/results/result.png")
    plt.show()
