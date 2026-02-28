from copy import deepcopy


def InsertSort(mylist):
    mycopy = deepcopy(mylist)
    for i in range(1, len(mycopy)):
        pom = mycopy[i]
        j = i - 1
        while mycopy[j] > pom and j >= 0:
            mycopy[j + 1] = mycopy[j]
            j -= 1
        mycopy[j + 1] = pom
    return mycopy
