from copy import deepcopy


def SelectionSort(mylist):
    mycopy = deepcopy(mylist)
    for i in range(len(mycopy) - 1):
        m = i
        for j in range(i + 1, len(mycopy)):
            if mycopy[j] < mycopy[m]:
                m = j
        mycopy[m], mycopy[i] = mycopy[i], mycopy[m]
    return mycopy
