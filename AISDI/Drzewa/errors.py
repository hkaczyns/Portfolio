class NoNodeError(Exception):
    def __init__(self) -> None:
        super().__init__("Node of a given value does not exist!")
