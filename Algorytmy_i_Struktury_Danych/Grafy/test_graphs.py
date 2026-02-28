from heap import Heap
from graph import Graph
from errors import HeapDeleteError, WrongPathFileError, IncorrectBoardError
import pytest


def test_heap_create():
    myheap2 = Heap()
    assert myheap2.array == []


def test_heap_insert():
    myheap = Heap()
    mylist = [2, 1, 6, 3, 0, 4]
    for item in mylist:
        myheap.insert(item)
    assert myheap.array == [0, 1, 4, 3, 2, 6]


def test_heap_delete():
    myheap = Heap()
    mylist = [2, 1, 6, 3, 0, 4]
    for item in mylist:
        myheap.insert(item)
    myheap.delete()
    assert myheap.array == [1, 2, 4, 3, 6]


def test_heap_delete_error():
    myheap = Heap()
    with pytest.raises(HeapDeleteError):
        myheap.delete()


def test_graph_incorrectpath_error():
    with pytest.raises(WrongPathFileError):
        Graph("abc.txt")


def test_graph_wronggraph_error():
    with pytest.raises(IncorrectBoardError):
        Graph("examples/wronggraph.txt")


def test_graph_dimensions():
    mygraph = Graph("examples/graf2.txt")
    assert mygraph.width == 3
    assert mygraph.height == 9


def test_graph_verges():
    mygraph = Graph("examples/graf2.txt")
    assert mygraph.start == (2, 1)
    assert mygraph.end == (7, 0)


def test_graph_path():
    mygraph = Graph("examples/graf4.txt")
    assert mygraph.path == [(2, 6), (3, 6), (3, 7), (3, 8), (2, 8)]
