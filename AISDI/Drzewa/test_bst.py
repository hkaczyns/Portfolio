from BST import BST_Node, BST_Tree
from errors import NoNodeError
import pytest


def test_bst_node_create():
    my_node = BST_Node(1)
    assert my_node.get_value() == 1
    assert my_node.get_left() is None
    assert my_node.get_right() is None


def test_bst_node_set_value():
    my_node = BST_Node(1)
    assert my_node.get_value() == 1
    my_node.set_value(2)
    assert my_node.get_value() == 2


def test_bst_node_set_left():
    my_node = BST_Node(1)
    assert my_node.get_left() is None
    my_left_node = BST_Node(5)
    my_node.set_left(my_left_node)
    assert my_node.get_left() == my_left_node


def test_bst_node_set_right():
    my_node = BST_Node(1)
    assert my_node.get_right() is None
    my_right_node = BST_Node(5)
    my_node.set_right(my_right_node)
    assert my_node.get_right() == my_right_node


def test_bst_node_insert_left():
    my_node = BST_Node(5)
    assert my_node.get_left() is None
    my_node.insert(1)
    assert my_node.get_left().get_value() == 1


def test_bst_node_insert_right():
    my_node = BST_Node(1)
    assert my_node.get_right() is None
    my_node.insert(5)
    assert my_node.get_right().get_value() == 5


def test_bst_tree_create():
    my_tree = BST_Tree()
    assert my_tree.top is None


def test_bst_tree_insert():
    my_tree = BST_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(3)
    assert my_tree.top.get_value() == 5
    assert my_tree.top.get_left().get_value() == 1
    assert my_tree.top.get_right().get_value() == 10
    assert my_tree.top.get_left().get_left() is None
    assert my_tree.top.get_left().get_right().get_value() == 3


def test_bst_tree_insert_duplicates():
    my_tree = BST_Tree()
    my_tree.insert(5)
    my_tree.insert(5)
    my_tree.insert(5)
    assert my_tree.top.get_value() == 5
    assert my_tree.top.get_left() is None
    assert my_tree.top.get_right().get_value() == 5
    assert my_tree.top.get_right().get_left() is None
    assert my_tree.top.get_right().get_right().get_value() == 5


def test_bst_tree_search_correct_top():
    my_tree = BST_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    assert my_tree.search(5).get_value() == 5


def test_bst_tree_search_correct_check_child():
    my_tree = BST_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(12)
    assert my_tree.search(10).get_value() == 10
    assert my_tree.search(10).get_left() is None
    assert my_tree.search(10).get_right().get_value() == 12


def test_bst_tree_search_incorrect():
    my_tree = BST_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(12)
    assert my_tree.search(13) is None


def test_bst_tree_delete_correct_1():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    my_tree.delete(10)
    assert my_tree.top.get_value() == 15
    assert my_tree.top.get_left().get_value() == 7
    assert my_tree.top.get_right() is None


def test_bst_tree_delete_correct_2():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    my_tree.insert(12)
    my_tree.delete(10)
    assert my_tree.top.get_value() == 12
    assert my_tree.top.get_left().get_value() == 7
    assert my_tree.top.get_right().get_value() == 15
    assert my_tree.top.get_right().get_left() is None
    assert my_tree.top.get_right().get_right() is None


def test_bst_tree_delete_correct_3():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    my_tree.insert(12)
    my_tree.insert(13)
    my_tree.delete(10)
    assert my_tree.top.get_value() == 12
    assert my_tree.top.get_left().get_value() == 7
    assert my_tree.top.get_right().get_value() == 15
    assert my_tree.top.get_right().get_left().get_value() == 13
    assert my_tree.top.get_right().get_right() is None


def test_bst_tree_delete_correct_4():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    my_tree.insert(12)
    my_tree.insert(13)
    my_tree.insert(11)
    my_tree.delete(10)
    assert my_tree.top.get_value() == 11
    assert my_tree.top.get_left().get_value() == 7
    assert my_tree.top.get_right().get_value() == 15
    assert my_tree.top.get_right().get_left().get_value() == 12
    assert my_tree.top.get_right().get_right() is None
    assert my_tree.top.get_right().get_left().get_left() is None
    assert my_tree.top.get_right().get_left().get_right().get_value() == 13


def test_bst_tree_delete_correct_5():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    my_tree.insert(12)
    my_tree.insert(13)
    my_tree.insert(11)
    my_tree.delete(12)
    assert my_tree.top.get_value() == 10
    assert my_tree.top.get_right().get_left().get_value() == 13


def test_bst_tree_delete_incorrect():
    my_tree = BST_Tree()
    my_tree.insert(10)
    my_tree.insert(7)
    my_tree.insert(15)
    with pytest.raises(NoNodeError):
        my_tree.delete(2)
