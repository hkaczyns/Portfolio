import time
import json
from bubble_sort import BubbleSort
from selection_sort import SelectionSort
from insert_sort import InsertSort
from merge_sort import MergeSort


def sort_words(sort_alg, words):
    """
    Sorts a list of words with a given sorting algorithm.
    Saves the time needed to sort.

    :param sort_alg: Sorting function.
    :type sort_alg: function

    :param words: List of elements to sort.
    :type words: list

    :return: A dictionary containing the sorted list and time needed to sort.
    """
    start = time.process_time()
    words_sorted = sort_alg(words)
    stop = time.process_time()
    return {"result": words_sorted, "time": round(stop - start, 5)}


def read_my_file(path, n=10000):
    """
    Reads a file of a given path and returns n first words.

    :param path: Path to file.
    :type path: string

    :param n: Number of words to return.
    :type n: int

    :return: List of n first words of a file.
    """
    words = []
    with open(path, "r") as f:
        for line in f:
            line = line.strip()
            if line != "":
                line_split = line.split(" ")
                words += [word for word in line_split if word != ""]
            if len(words) >= n:
                break
    return words[:n]


def load_data(path):
    """
    Loads results from the json file and returns them.

    :param path: Path to file.
    :type path: string

    :return: Results from json file
    """
    with open(path, "r") as f:
        results = json.load(f)
        return results


def analize(path_to_file, path_to_save, samples=[10000]):
    """
    Runs analitics of multiple sorting algorithms on samples of given size.
    Saves results containing the sample size and the time needed to sort.

    :param path: Path to file.
    :type path: string

    :param samples: List containing sample sizes to run analitics on.
    :type samples: list of integers

    :return: A dictionary containing the results for each algorithm
            and sample size.
    """
    results = {}

    sort_algs = {
        "Bubble sort": BubbleSort,
        "Selection sort": SelectionSort,
        "Insert sort": InsertSort,
        "Merge sort": MergeSort,
    }

    words = read_my_file(path_to_file, n=max(samples))

    for sample in samples:
        print(f"\nSample: {sample} words")
        for alg in sort_algs:
            result = sort_words(sort_algs[alg], words[:sample])
            print(f'{alg}: {result["time"]}s')
            if alg not in results:
                results[alg] = {"n": [], "times": []}
            alg_results = results[alg]
            alg_results["n"].append(sample)
            alg_results["times"].append(result["time"])

    with open(path_to_save, "w") as f:
        json.dump(results, f)

    return results
