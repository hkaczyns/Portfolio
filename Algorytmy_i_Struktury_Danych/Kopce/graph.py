import matplotlib.pyplot as plt


def draw_graph(sizes, d_arn, results):
    """
    Draws the graph displaying time to process the operations of heap
    creation and deletion.

    :param sizes: List of sample sizes the analysis has been run on.
    :type sizes: List of int

    :param d_arn: Values of d the analysis has been run on.
    :type d_arn: List of int

    :param results: List of results.
    :type result: List of lists of int
    """
    figure, axis = plt.subplots(2, 1)
    figure.set_figheight(10)
    for i in range(2):
        for j in range(3):
            axis[i].plot(sizes, results[i][j])
            axis[i].set_xlabel("Number of numbers in array")
            axis[i].set_ylabel("Time to process the operation (s)")
            axis[i].legend(d_arn)
    axis[0].set_title("Time to process heap creation by d")
    axis[1].set_title("Time to process heap deletion by d")
    plt.savefig("Kopce/results/result.png")
    plt.show()
