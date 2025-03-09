from copy import deepcopy


def BubbleSort(mylist):
    mycopy = deepcopy(mylist)
    for i in range(1, len(mycopy)):
        for j in range(len(mycopy) - i):
            if mycopy[j] > mycopy[j + 1]:
                mycopy[j], mycopy[j + 1] = mycopy[j + 1], mycopy[j]
    return mycopy
