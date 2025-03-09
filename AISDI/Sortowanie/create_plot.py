from matplotlib import pyplot as plt


def plot_results(results):
    """
    Plots the results.

    :param results: A dictionary containing the results for each algorithm
            and sample size.
    :type results: dict
    """
    for alg in results.values():
        plt.plot(alg["n"], alg["times"])
    plt.legend(results.keys())
    plt.title("Time to sort a list of words by sorting algorithm")
    plt.xlabel("Number of words to sort")
    plt.ylabel("Time needed to sort (in seconds)")
    plt.savefig("results/result.png")
    plt.show()
