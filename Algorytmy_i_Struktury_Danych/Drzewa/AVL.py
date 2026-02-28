class AVL_Node:
    def __init__(self, value):
        self._value = value
        self._left = None
        self._right = None
        self._level = 1

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

    def get_level(self):
        return self._level

    def set_level(self, value):
        self._level = value


class AVL_Tree:
    def __init__(self):
        self.top = None

    def get_top(self):
        return self.top

    def set_top(self, node):
        self.top = node

    def check_level(self, node):
        """
        Returns the level of the node. If node is None, returns 0
        """
        if node:
            return node.get_level()
        return 0

    def check_balance_factor(self, node):
        """
        Returns the balance factor of a given node.
        """
        if node:
            return self.check_level(node.get_left()) - self.check_level(
                node.get_right()
            )
        return 0

    def rotate_left(self, node):
        """
        Rotates the node to the left
        """
        node_right = node.get_right()
        node_right_left = node_right.get_left()
        node_right.set_left(node)
        node.set_right(node_right_left)

        node.set_level(
            max(
                self.check_level(node.get_left()),
                self.check_level(node.get_right()),
            )
            + 1
        )

        node_right.set_level(
            max(
                self.check_level(node_right.get_left()),
                self.check_level(node_right.get_right()),
            )
            + 1
        )

        return node_right

    def rotate_right(self, node):
        """
        Rotates the node to the right
        """
        node_left = node.get_left()
        node_left_right = node_left.get_right()
        node_left.set_right(node)
        node.set_left(node_left_right)

        node.set_level(
            max(
                self.check_level(node.get_left()),
                self.check_level(node.get_right()),
            )
            + 1
        )

        node_left.set_level(
            max(
                self.check_level(node_left.get_left()),
                self.check_level(node_left.get_right()),
            )
            + 1
        )

        return node_left

    def insert(self, value):
        """
        Inserts value at the top of the tree
        """
        if self.top:
            new_top = self.insert_rec(value, self.top)
            self.set_top(new_top)
        else:
            self.top = AVL_Node(value)

    def insert_rec(self, value, node):
        """
        Inserts value recursively
        """
        # Insert element without balancing the tree first
        if node is None:
            return AVL_Node(value)
        if value >= node.get_value():
            node.set_right(self.insert_rec(value, node.get_right()))
        else:
            node.set_left(self.insert_rec(value, node.get_left()))

        node.set_level(
            max(
                self.check_level(node.get_left()),
                self.check_level(node.get_right()),
            )
            + 1
        )

        node_bf = self.check_balance_factor(node)

        # Rotate node accordingly in order to balance it
        if node_bf < -1:
            if value >= node.get_right().get_value():
                return self.rotate_left(node)
            else:
                node.set_right(self.rotate_right(node.get_right()))
                return self.rotate_left(node)
        elif node_bf > 1:
            if value < node.get_left().get_value():
                return self.rotate_right(node)
            else:
                node.set_left(self.rotate_left(node.get_left()))
                return self.rotate_right(node)

        return node

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
