class HeapDeleteError(Exception):
    def __init__(self):
        super().__init__(
            "Can't delete item from heap - heap does not contain any elements!"
        )
