def draw(tree, canvas_width=256, numbers_to_show=20):
    """
    Draws the given number of nodes of the tree in the terminal
    """
    level_len = 1
    node_len = 2
    nodes_on_level = [tree.top]
    side_spacing = (canvas_width - level_len * node_len) // 2
    middle_spacing = 0
    numbers_shown = 0

    while (
        len([elem for elem in nodes_on_level if elem is None]) != level_len
        and numbers_shown < numbers_to_show
    ):
        drawing_str = " " * side_spacing
        next_level = []
        for node in nodes_on_level:
            if node:
                drawing_str += str(node.get_value()) + middle_spacing * " "
                next_level += [node.get_left(), node.get_right()]
            else:
                drawing_str += "-" + middle_spacing * " "
                next_level += [None, None]
        nodes_on_level = next_level
        numbers_shown += level_len
        level_len *= 2
        side_spacing = side_spacing // 2
        middle_spacing = max(
            round(
                (canvas_width - (2 * side_spacing + level_len * node_len))
                / (level_len - 1)
                + 1
            ),
            1,
        )

        print(drawing_str + "\n")
    print(
        "If the drawing is shown incorrectly because of word wrapping, use \
Alt+Z to turn off word wrapping and run the program again.\n"
    )
