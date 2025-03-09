import gc
from analize import analize, load_data
from create_plot import plot_results


def main():
    # Turn off garbage collector
    gc_old = gc.isenabled()
    gc.disable()

    # Quantities of words from file to be analized
    samples = [10, 100, 200, 300, 400, 1000, 2000, 5000, 7500, 10000]

    # Path to file to save and load results
    path_to_results = "results/sorting_results.json"

    # Change to True if you want to rerun the sorting algorithms
    # If False, imports the data from the file prepared beforehand
    rerun = True

    if rerun:
        results = analize(
            "pan-tadeusz-unix.txt", path_to_results, samples=samples
        )
    else:
        results = load_data(path_to_results)

    # Plot the results
    plot_results(results)

    # Turn on the garbage collector
    if gc_old:
        gc.enable()


if __name__ == "__main__":
    main()
