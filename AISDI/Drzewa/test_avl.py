from AVL import AVL_Node, AVL_Tree


def test_avl_node_create():
    my_node = AVL_Node(1)
    assert my_node.get_value() == 1
    assert my_node.get_left() is None
    assert my_node.get_right() is None


def test_avl_node_set_value():
    my_node = AVL_Node(1)
    assert my_node.get_value() == 1
    my_node.set_value(2)
    assert my_node.get_value() == 2


def test_avl_node_set_left():
    my_node = AVL_Node(1)
    assert my_node.get_left() is None
    my_left_node = AVL_Node(5)
    my_node.set_left(my_left_node)
    assert my_node.get_left() == my_left_node


def test_avl_node_set_right():
    my_node = AVL_Node(1)
    assert my_node.get_right() is None
    my_right_node = AVL_Node(5)
    my_node.set_right(my_right_node)
    assert my_node.get_right() == my_right_node


def test_avl_tree_create():
    my_tree = AVL_Tree()
    assert my_tree.get_top() is None


def test_avl_tree_insert_at_top():
    my_tree = AVL_Tree()
    my_tree.insert(1)
    assert my_tree.get_top().get_value() == 1


def test_avl_tree_insert_easy():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    assert my_tree.get_top().get_value() == 5


def test_avl_tree_insert():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(3)
    assert my_tree.top.get_value() == 5
    assert my_tree.top.get_left().get_value() == 1
    assert my_tree.top.get_right().get_value() == 10
    assert my_tree.top.get_left().get_left() is None
    assert my_tree.top.get_left().get_right().get_value() == 3


def test_avl_tree_insert_duplicates():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(5)
    my_tree.insert(5)
    assert my_tree.top.get_value() == 5
    assert my_tree.top.get_left().get_value() == 5
    assert my_tree.top.get_right().get_value() == 5
    assert my_tree.top.get_right().get_left() is None
    assert my_tree.top.get_right().get_right() is None


def test_avl_tree_search_correct_top():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    assert my_tree.search(5).get_value() == 5


def test_avl_tree_search_correct_check_child():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(12)
    assert my_tree.search(10).get_value() == 10
    assert my_tree.search(10).get_left() is None
    assert my_tree.search(10).get_right().get_value() == 12


def test_avl_tree_search_incorrect():
    my_tree = AVL_Tree()
    my_tree.insert(5)
    my_tree.insert(1)
    my_tree.insert(10)
    my_tree.insert(12)
    assert my_tree.search(13) is None
