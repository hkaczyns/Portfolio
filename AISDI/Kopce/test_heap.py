from heap import Heap
from errors import HeapDeleteError
import pytest


def test_heap_create_2():
    myheap2 = Heap(2)
    assert myheap2.d == 2
    assert myheap2.array == []


def test_heap_create_5():
    myheap5 = Heap(5)
    assert myheap5.d == 5
    assert myheap5.array == []


def test_heap_create_7():
    myheap7 = Heap(7)
    assert myheap7.d == 7
    assert myheap7.array == []


def test_heap_insert_2():
    myheap2 = Heap(2)
    mylist = [2, 1, 6, 3, 0, 4]
    for item in mylist:
        myheap2.insert(item)
    assert myheap2.array == [6, 3, 4, 1, 0, 2]


def test_heap_insert_5():
    myheap5 = Heap(5)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7]
    for item in mylist:
        myheap5.insert(item)
    assert myheap5.array == [7, 6, 2, 3, 0, 4, 1, 3]


def test_heap_insert_7():
    myheap7 = Heap(7)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7, 9, 2]
    for item in mylist:
        myheap7.insert(item)
    assert myheap7.array == [9, 7, 2, 3, 0, 4, 3, 6, 1, 2]


def test_heap_delete_2():
    myheap2 = Heap(2)
    mylist = [2, 1, 6, 3, 0, 4]
    for item in mylist:
        myheap2.insert(item)
    myheap2.delete()
    assert myheap2.array == [4, 3, 2, 1, 0]


def test_heap_delete_5():
    myheap5 = Heap(5)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7]
    for item in mylist:
        myheap5.insert(item)
    myheap5.delete()
    assert myheap5.array == [6, 3, 2, 3, 0, 4, 1]


def test_heap_delete_7():
    myheap7 = Heap(7)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7, 9, 2]
    for item in mylist:
        myheap7.insert(item)
    myheap7.delete()
    assert myheap7.array == [7, 2, 2, 3, 0, 4, 3, 6, 1]


def test_heap_delete_error():
    myheap = Heap(2)
    with pytest.raises(HeapDeleteError):
        myheap.delete()


def test_heap_clear_2():
    myheap2 = Heap(2)
    mylist = [2, 1, 6, 3, 0, 4]
    for item in mylist:
        myheap2.insert(item)
    myheap2.clear()
    assert myheap2.array == []


def test_heap_clear_5():
    myheap5 = Heap(5)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7]
    for item in mylist:
        myheap5.insert(item)
    myheap5.clear()
    assert myheap5.array == []


def test_heap_clear_7():
    myheap7 = Heap(7)
    mylist = [2, 1, 6, 3, 0, 4, 3, 7, 9, 2]
    for item in mylist:
        myheap7.insert(item)
    myheap7.clear()
    assert myheap7.array == []


def test_heap_levels_2():
    myheap2 = Heap(2)
    mylist = [1] * 8
    for item in mylist:
        myheap2.insert(item)
    assert myheap2._levels(8) == 4
    myheap2.delete()
    assert myheap2._levels(7) == 3


def test_heap_levels_5():
    myheap5 = Heap(5)
    mylist = [1] * 32
    for item in mylist:
        myheap5.insert(item)
    assert myheap5._levels(32) == 4
    myheap5.delete()
    assert myheap5._levels(31) == 3


def test_heap_levels_7():
    myheap7 = Heap(7)
    mylist = [1] * 58
    for item in mylist:
        myheap7.insert(item)
    assert myheap7._levels(58) == 4
    myheap7.delete()
    assert myheap7._levels(57) == 3
