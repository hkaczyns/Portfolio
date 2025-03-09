from random import sample
import time
import gc
from BST import BST_Tree
from draw import draw


def analize(tree):
    results = [[[], []], [[], []], [[], []]]
    random_numbers = sample(range(1, 30000), 10000)
    print("Insert:")
    for num in range(1000, 10001, 1000):
        time_result = time_insert(random_numbers[:num], tree)
        results[0][0].append(time_result)
        results[0][1].append(num)
        print(f"{num}: {time_result} s")

    print("\nSearch:")
    for num in range(1000, 10001, 1000):
        time_result = time_search(random_numbers[:num], tree)
        results[1][0].append(time_result)
        results[1][1].append(num)
        print(f"{num}: {time_result} s")

    if tree == BST_Tree:
        print("\nDelete:")
        for num in range(1000, 10001, 1000):
            time_result = time_delete(random_numbers[:num], tree)
            results[2][0].append(time_result)
            results[2][1].append(num)
            print(f"{num}: {time_result} s")

    print("\nExample drawing:")
    draw_example(tree)
    return results


def gc_off():
    # Turn off garbage collector
    gc.disable()


def gc_on():
    # Turn on the garbage collector
    if gc.isenabled():
        gc.enable()


def time_insert(test_list, tree):
    tree = tree()

    gc_off()
    start = time.process_time()

    for num in test_list:
        tree.insert(num)

    stop = time.process_time()
    gc_on()
    return round(stop - start, 5)


def time_search(test_list, tree):
    tree = tree()
    for num in test_list:
        tree.insert(num)

    gc_off()
    start = time.process_time()

    for num in test_list:
        tree.search(num)

    stop = time.process_time()
    gc_on()
    return round(stop - start, 5)


def time_delete(test_list, tree):
    tree = tree()
    for num in test_list:
        tree.insert(num)

    gc_off()
    start = time.process_time()

    for num in test_list:
        tree.delete(num)

    stop = time.process_time()
    gc_on()
    return round(stop - start, 5)


def draw_example(tree):
    random_numbers = sample(range(1, 30000), 20)
    my_tree = tree()
    for num in random_numbers:
        my_tree.insert(num)
    draw(my_tree)
