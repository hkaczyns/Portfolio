from random import randint
import time
import gc
import json

from heap import Heap
from graph import draw_graph


def run(sizes, d_arn, save=True):
    """
    Runs the time_create and time_delete functions for each sample size
    and each d.

    :param sizes: List of sample sizes to time the operations on.
    :type sizes: list of int

    :param d_arn: List of d values to time the operations on.
    :type d_arn: list of int

    :param save: Information whether to store the results in a
                 json file or not.
    :type save: bool

    :return: results - list representing the results
    """
    # Turn off garbage collector
    gc_old = gc.isenabled()
    gc.disable()

    results = [[[], [], []], [[], [], []]]

    mylist = [randint(1, 300000) for i in range(100000)]

    for i in range(len(d_arn)):
        for n in sizes:
            results[0][i].append(time_create(d_arn[i], n, mylist))
        print("\n")

    for i in range(len(d_arn)):
        for n in sizes:
            results[1][i].append(time_delete(d_arn[i], n, mylist))
        print("\n")

    # Turn on the garbage collector
    if gc_old:
        gc.enable()

    if save:
        save_results(sizes, d_arn, results)

    display(d_arn, mylist)

    return results


def analize(rerun=True):
    """
    Runs the analysis and starts the function to draw the graph.

    :param rerun: Information whether to rerun the analysis or not.
    :type rerun: bool
    """
    my_sizes = range(10000, 110000, 10000)
    d_arn = [2, 5, 7]

    if rerun:
        results = run(my_sizes, d_arn)

    else:
        print("Data loaded from file - might not adhere to given parameters")
        f = load_results()
        my_sizes = f["sizes"]
        d_arn = f["d"]
        results = f["results"]

    draw_graph(my_sizes, d_arn, results)


def time_create(d, n, mylist):
    """
    Measures time of completing the heap creation operation.

    :param d: d of the heap.
    :type d: int

    :param n: Number of elements the heap should insert.
    :type n: int

    :param mylist: List of elements to insert.
    :type mylist: list of int

    :return: Time of completing the operation.
    :
    """
    myheap = Heap(d)
    mylist_sliced = mylist[:n]
    start = time.process_time()
    for item in mylist_sliced:
        myheap.insert(item)
    stop = time.process_time()
    print(d, n, round(stop - start, 5))
    return round(stop - start, 5)


def time_delete(d, n, mylist):
    """
    Measures time of completing the heap deletion operation.

    :param d: d of the heap.
    :type d: int

    :param n: Number of elements the heap should insert and then delete.
    :type n: int

    :param mylist: List of elements to insert and then delete.
    :type mylist: list of int

    :return: Time of completing the operation.
    :
    """
    myheap = Heap(d)
    for item in mylist[:n]:
        myheap.insert(item)
    start = time.process_time()
    for _ in range(n):
        myheap.delete()
    stop = time.process_time()
    print(d, n, round(stop - start, 5))
    return round(stop - start, 5)


def save_results(sizes, d_arn, results):
    """
    Saves results to the json file.

    :param sizes: List of sample sizes the analysis has been run on.
    :type sizes: List of int

    :param d_arn: Values of d the analysis has been run on.
    :type d_arn: List of int

    :param results: List of results.
    :type result: List of lists of int
    """
    with open("Kopce/results/results.json", "w+") as f:
        json.dump({"sizes": list(sizes), "d": d_arn, "results": results}, f)


def load_results():
    """
    Loads the results from the json file.

    :return: List of results
    """
    with open("Kopce/results/results.json", "r") as f:
        content = json.load(f)
        return content


def display(d_arn, mylist, num=30):
    """
    Runs the draw function for the first num elements of the heap
    for each d value.

    :param d_arn: Values of d of the heap.
    :type d_arn: List of int

    :param mylist: List of elements to insert to the heap.
    :type mylist: list of int

    :param num: Number of elements to show in the drawing.
    :type num: int
    """
    for n in d_arn:
        myheap = Heap(n)
        for item in mylist:
            myheap.insert(item)
        print(f"{n}-degree heap presentation:\n")
        myheap.draw(num)
    print(
        "(If the drawing is unclear because of word wrapping, press Alt+Z in \
the terminal and re-run the program.)"
    )
