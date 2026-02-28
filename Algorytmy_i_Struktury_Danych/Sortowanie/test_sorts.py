from bubble_sort import BubbleSort
from selection_sort import SelectionSort
from insert_sort import InsertSort
from merge_sort import MergeSort


def test_bubble_numbers():
    mylist = [0, 4, 1, 2, -5]
    assert BubbleSort(mylist) == [-5, 0, 1, 2, 4]
    assert mylist == [0, 4, 1, 2, -5]


def test_bubble_words():
    mylist = ["Uniwersytet", "Warszawski", "<", "Politechnika", "Warszawska"]
    assert BubbleSort(mylist) == [
        "<",
        "Politechnika",
        "Uniwersytet",
        "Warszawska",
        "Warszawski",
    ]
    assert mylist == [
        "Uniwersytet",
        "Warszawski",
        "<",
        "Politechnika",
        "Warszawska",
    ]


def test_selection_numbers():
    mylist = [0, 4, 1, 2, -5]
    assert SelectionSort(mylist) == [-5, 0, 1, 2, 4]
    assert mylist == [0, 4, 1, 2, -5]


def test_selection_words():
    mylist = ["Uniwersytet", "Warszawski", "<", "Politechnika", "Warszawska"]
    assert SelectionSort(mylist) == [
        "<",
        "Politechnika",
        "Uniwersytet",
        "Warszawska",
        "Warszawski",
    ]
    assert mylist == [
        "Uniwersytet",
        "Warszawski",
        "<",
        "Politechnika",
        "Warszawska",
    ]


def test_insert_numbers():
    mylist = [0, 4, 1, 2, -5]
    assert InsertSort(mylist) == [-5, 0, 1, 2, 4]
    assert mylist == [0, 4, 1, 2, -5]


def test_insert_words():
    mylist = ["Uniwersytet", "Warszawski", "<", "Politechnika", "Warszawska"]
    assert InsertSort(mylist) == [
        "<",
        "Politechnika",
        "Uniwersytet",
        "Warszawska",
        "Warszawski",
    ]
    assert mylist == [
        "Uniwersytet",
        "Warszawski",
        "<",
        "Politechnika",
        "Warszawska",
    ]


def test_merge_numbers():
    mylist = [0, 4, 1, 2, -5]
    assert MergeSort(mylist) == [-5, 0, 1, 2, 4]
    assert mylist == [0, 4, 1, 2, -5]


def test_merge_words():
    mylist = ["Uniwersytet", "Warszawski", "<", "Politechnika", "Warszawska"]
    assert MergeSort(mylist) == [
        "<",
        "Politechnika",
        "Uniwersytet",
        "Warszawska",
        "Warszawski",
    ]
    assert mylist == [
        "Uniwersytet",
        "Warszawski",
        "<",
        "Politechnika",
        "Warszawska",
    ]
