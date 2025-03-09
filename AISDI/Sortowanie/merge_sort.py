def Merge(first_list, second_list):
    result = [None] * (len(first_list) + len(second_list))
    i = 0
    j = 0
    index = 0
    while i < len(first_list) and j < len(second_list):
        if first_list[i] < second_list[j]:
            result[index] = first_list[i]
            i += 1
        else:
            result[index] = second_list[j]
            j += 1
        index += 1
    while i < len(first_list):
        result[index] = first_list[i]
        i += 1
        index += 1
    while j < len(second_list):
        result[index] = second_list[j]
        j += 1
        index += 1
    return result


def MergeSort(mylist):
    if len(mylist) > 1:
        middle = len(mylist) // 2
        first = MergeSort(mylist[:middle])
        second = MergeSort(mylist[middle:])
        sorted_list = Merge(first, second)
        return sorted_list
    return mylist
