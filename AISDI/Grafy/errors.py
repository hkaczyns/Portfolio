class HeapDeleteError(Exception):
    def __init__(self):
        super().__init__(
            "Can't delete item from heap - heap does not contain any elements!"
        )


class IncorrectBoardError(Exception):
    def __init__(self):
        super().__init__(
            "Board should have precisely two '0' chars (start and finish)"
        )


class WrongPathFileError(Exception):
    def __init__(self) -> None:
        super().__init__("Incorrect filepath!")
