# AISDI 2024L - Zadanie 4. Grafy (M. Bogusławski, H. Kaczyński)
Pełna dokumentacja znajduje się w pliku "ZAD4 - sprawozdanie.pdf".

## Opis projektu
W pliku graph.py znajduje się implementacja klasy Graph, której obiekty reprezentują grafy pozwalające uzyskać najmniej kosztowną trasę przejścia pomiędzy polami z cyfrą 0.

W pliku heap.py znajduje się implementacja klasy Heap, stanowiąca zmodyfikowaną wersję kopca zaimplementowanego w ramach rozwiązania zadania Kopce.

W pliku test_graphs.py znajdują się testy jednostkowe sprawdzające poprawność działania metod wyżej wymienionych klas.

W pliku errors.py znajduje się implementacja specjalnych wyjątków.

W pliku main.py znajduje się funkcja main, wywołująca prezentację rozwiązania.

W folderze examples znajdują się pliki tekstowe z przykładowymi planszami.

W folderze results w plikach result1.png, result2.png, result3.png i result4.png znajdują się zrzuty ekranów z wynikami działania programu dla przykładowych plansz.


## Opis środowiska
Implementacja i testowanie kodu przeprowadzone zostało, wykorzystując wersję 3.10.12 64-bit języka Python.

Projekt korzysta z następujących bibliotek zewnętrznych:
- pytest 8.1.1

Oraz następujących bibliotek wewnętrznych:
- sys


## Procedura uruchomienia
W celu poprawnego działania projekt należy uruchomić poprzez plik main.py z głównego folderu repozytorium, wpisując w terminal komendę zgodną z szablonem „python3 Grafy/main.py <filepath>”, np. „python3 Grafy/main.py Grafy/examples/graf3.txt”. 

## Podział zadań
Cała zawartość projektu była przez nas współtworzona na każdym etapie opracowywania, implementacji, refaktoryzacji oraz testowania rozwiązania.