from errors import HeapDeleteError


class Heap:
    def __init__(self):
        self.array = []

    def empty(self):
        return len(self.array) == 0

    def __len__(self):
        return len(self.array)

    def insert(self, item):
        """
        Inserts the item to the heap in the correct place.

        :param item: Item to insert to the heap.
        :type item: int
        """
        n = len(self.array)
        self.array.append(item)

        # Comparing two arrays compares the first element,
        # In our case distance, which is desired
        while n > 0 and self.array[(n - 1) // 2] > item:
            self.array[(n - 1) // 2], self.array[n] = (
                self.array[n],
                self.array[(n - 1) // 2],
            )
            n = (n - 1) // 2

    def delete(self):
        """
        Properly deletes the item from the top of the heap.
        """
        if len(self.array) == 0:
            raise HeapDeleteError
        to_remember = self.array[0]
        self.array[0] = self.array[-1]
        self.array.pop()
        ind = 0
        ind_min = 0

        while ind < len(self.array):
            child_ind = ind * 2 + 1

            for i in range(2):
                if child_ind + i >= len(self.array):
                    break
                if (
                    self.array[child_ind + i] < self.array[ind]
                    and self.array[ind_min] > self.array[child_ind + i]
                ):
                    ind_min = child_ind + i

            if ind_min > ind:
                self.array[ind], self.array[ind_min] = (
                    self.array[ind_min],
                    self.array[ind],
                )
                ind = ind_min
            else:
                break

        return to_remember
