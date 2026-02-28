from errors import IncorrectBoardError, WrongPathFileError
from heap import Heap


class Graph:
    def __init__(self, filepath):
        self.board = []
        self.width = None
        self.height = None
        self.start = None
        self.end = None
        self.path = []
        self.load(filepath)
        self.get_path()

    def load(self, filepath):
        """
        Loads the board from the file of given path
        and validates its correctness.
        :param filepath: Path to file.
        :type  filepath: str
        """
        self.board = []
        try:
            with open(filepath, "r") as f:
                for line in f:
                    if line != "":
                        line = line.rstrip()
                        self.board.append([int(el) for el in line])
        except FileNotFoundError:
            raise WrongPathFileError
        self.width = len(self.board[0])
        self.height = len(self.board)

        # Get indices of start and end (two '0' chars on board)
        verges = [
            (i, j)
            for i in range(self.height)
            for j in range(self.width)
            if self.board[i][j] == 0
        ]
        if len(verges) != 2:
            raise IncorrectBoardError
        self.start, self.end = verges[0], verges[1]

    def get_path(self):
        """
        Analizes the path between start and end with the shortest distance.
        """

        # Info whether a vertex has been visited already
        visited = [
            [False for _ in range(self.width)] for _ in range(self.height)
        ]

        # Distance from start to each vertex
        distance = [
            [float("inf") for _ in range(self.width)]
            for _ in range(self.height)
        ]
        distance[self.start[0]][self.start[1]] = 0
        myheap = Heap()
        myheap.insert((0, self.start[0], self.start[1]))

        # Analize vertex with the smallest distance
        while not myheap.empty():
            cur_distance, cur_y, cur_x = myheap.delete()

            if not visited[cur_y][cur_x]:
                visited[cur_y][cur_x] = True

                # Update information about the neighbours
                for x_change, y_change in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                    new_x, new_y = cur_x + x_change, cur_y + y_change

                    if (
                        0 <= new_x < self.width
                        and 0 <= new_y < self.height
                        and not visited[new_y][new_x]
                    ):
                        new_distance = cur_distance + self.board[new_y][new_x]
                        if new_distance < distance[new_y][new_x]:
                            distance[new_y][new_x] = new_distance
                            myheap.insert((new_distance, new_y, new_x))

        # Return the path, starting from the end
        self.path = []
        cur_point = self.end

        while cur_point != self.start:
            self.path.append(cur_point)
            min_distance = float("inf")
            next_point = None

            # Look at each neighbour and find one with the smallest distance
            for x_change, y_change in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                new_y, new_x = cur_point[0] + y_change, cur_point[1] + x_change

                if (
                    0 <= new_x < self.width
                    and 0 <= new_y < self.height
                    and distance[new_y][new_x] < min_distance
                ):
                    min_distance = distance[new_y][new_x]
                    next_point = (new_y, new_x)
            cur_point = next_point

        self.path.append(self.start)
        self.path = self.path[::-1]

    def print_board(self):
        """
        Prints out the whole board.
        """
        for row in self.board:
            print(*row)

    def print_path(self, sep=" "):
        """
        Prints out the path with the shortest distance.
        """
        for y in range(self.height):
            row = ""
            for x in range(self.width):
                if (y, x) in self.path:
                    row += str(self.board[y][x])
                else:
                    row += sep
            print(row)
