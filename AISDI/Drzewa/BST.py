from errors import NoNodeError


class BST_Node:
    def __init__(self, value):
        self._value = value
        self._left = None
        self._right = None

    def get_value(self):
        return self._value

    def set_value(self, value):
        self._value = value

    def get_left(self):
        return self._left

    def set_left(self, node):
        self._left = node

    def get_right(self):
        return self._right

    def set_right(self, node):
        self._right = node

    def insert(self, value):
        """
        Inserts value to the tree recursively.
        """
        if value < self._value:
            if self._left:
                self._left.insert(value)
            else:
                self._left = BST_Node(value)
        else:
            if self._right:
                self._right.insert(value)
            else:
                self._right = BST_Node(value)


class BST_Tree:
    def __init__(self):
        self.top = None

    def insert(self, value):
        """
        Checks if the inserted node will be the first node in the tree
        and acts accordingly
        """
        if self.top:
            self.top.insert(value)
        else:
            self.top = BST_Node(value)

    def search(self, value):
        """
        Looks for the given value in the tree and returns the node if exists.
        Returns None, if the value does not exist in the tree.
        """
        current_node = self.top

        while current_node is not None and current_node.get_value() != value:
            if value < current_node.get_value():
                current_node = current_node.get_left()
            else:
                current_node = current_node.get_right()
        return current_node

    def delete(self, value):
        """
        Deletes the node of a given value based on the number of children
        that node has.
        """
        # Search for the node to delete and a parent of that node
        node_to_delete = self.top
        parent_node = self.top

        # Info whether the node is the left or a right child of its parent
        node_on_left = True

        while (
            node_to_delete is not None and node_to_delete.get_value() != value
        ):
            parent_node = node_to_delete
            if value < node_to_delete.get_value():
                node_to_delete = node_to_delete.get_left()
                node_on_left = True
            else:
                node_to_delete = node_to_delete.get_right()
                node_on_left = False

        if node_to_delete is None:
            raise NoNodeError

        # If no children, just delete parent's reference
        if (
            node_to_delete.get_left() is None
            and node_to_delete.get_right() is None
        ):
            if node_to_delete == self.top:
                self.top = None
                return
            if node_on_left:
                parent_node.set_left(None)
            else:
                parent_node.set_right(None)
            del node_to_delete
            return

        # If only one child exists, replace with child
        if node_to_delete.get_left() is None:
            child = node_to_delete.get_right()
            node_to_delete.set_value(child.get_value())
            node_to_delete.set_left(child.get_left())
            node_to_delete.set_right(child.get_right())
        elif node_to_delete.get_right() is None:
            child = node_to_delete.get_left()
            node_to_delete.set_value(child.get_value())
            node_to_delete.set_left(child.get_left())
            node_to_delete.set_right(child.get_right())

        # If two children exist, replace with child of smallest bigger value
        else:
            parent = node_to_delete
            child = node_to_delete.get_right()

            while child.get_left() is not None:
                parent = child
                child = child.get_left()

            # If the smallest bigger value is just a node on the right
            # then simply put that node in the place of node to replace
            if parent == node_to_delete:
                node_to_delete.set_right(child.get_right())
            # If it is not, put the value in the node to replace
            # and replace its parent's left side with its right side
            else:
                parent.set_left(child.get_right())

            node_to_delete.set_value(child.get_value())
            del child
