from errors import HeapDeleteError


class Heap:
    def __init__(self, d):
        self.array = []
        self.d = d

    def clear(self):
        """
        Clears the contents of the heap.
        """
        self.array = []

    def insert(self, item):
        """
        Inserts the item to the heap in the correct place.

        :param item: Item to insert to the heap.
        :type item: int
        """
        n = len(self.array)
        self.array.append(item)
        while n > 0 and self.array[(n - 1) // self.d] < item:
            self.array[(n - 1) // self.d], self.array[n] = (
                self.array[n],
                self.array[(n - 1) // self.d],
            )
            n = (n - 1) // self.d

    def delete(self):
        """
        Properly deletes the item from the top of the heap.
        """
        if len(self.array) == 0:
            raise HeapDeleteError
        self.array[0] = self.array[-1]
        self.array.pop()
        ind = 0
        ind_max = 0

        while ind < len(self.array):
            child_ind = ind * self.d + 1

            for i in range(self.d):
                if child_ind + i >= len(self.array):
                    break
                if (
                    self.array[child_ind + i] > self.array[ind]
                    and self.array[ind_max] < self.array[child_ind + i]
                ):
                    ind_max = child_ind + i

            if ind_max > ind:
                self.array[ind], self.array[ind_max] = (
                    self.array[ind_max],
                    self.array[ind],
                )
                ind = ind_max
            else:
                break

    def _levels(self, elements):
        """
        Counts the number of levels the heap has
        if only given number of elements is considered.

        :param elements: Number of elements to consider.
        :type elements: int

        :return: Number of heap levels.
        """
        levels = 0
        temp = 0
        while temp < elements:
            temp += self.d**levels
            levels += 1
        return levels

    def draw(self, elements):
        """
        Draws the first "elements" elements of the heap in the terminal.

        :param elements: Number of elements to draw.
        :type elements: int
        """
        levels = self._levels(elements)

        element_len = len(str(self.array[0]))
        drawing_len = (self.d ** (levels - 1)) * (element_len + 1) + 1
        result = ""
        ind = 0

        # Spacing between left side and first element
        side_space_len = (drawing_len - element_len) // 2

        # Spacing between elements
        middle_space_len = 0

        count = 0

        for level in range(levels):

            if level > 0:
                middle_space_len = max(
                    round(
                        (
                            drawing_len
                            - (
                                2 * side_space_len
                                + element_len * (self.d**level)
                            )
                        )
                        / (self.d**level - 1)
                    ),
                    1,
                )
            result += side_space_len * " "
            for i in range(self.d**level):

                result += str(self.array[ind + i]) + middle_space_len * " "
                count += 1

                if count >= elements:
                    break
            side_space_len = side_space_len // self.d

            ind = ind * self.d + 1
            result += "\n"
        print(result)
