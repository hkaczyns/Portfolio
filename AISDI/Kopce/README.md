# AISDI 2024L - Zadanie 2. Kopce (M. Bogusławski, H. Kaczyński)
Pełna dokumentacja wraz z wykresami znajduje się w pliku "ZAD2 - sprawozdanie.pdf".

## Opis projektu
W pliku heap.py znajduje się implementacja klasy Heap, która pozwala na tworzenie n-arnych kopców oraz efektywne wyświetlanie 30 pierwszych ich elementów.

W pliku test_heap.py znajdują się testy jednostkowe sprawdzające poprawność działania metod klasy Heap.

W pliku analize.py znajduje się implementacja funkcji wywołujących prezentację rozwiązania i odpowiednie pomiary czasowe.

W pliku graph.py znajduje się implementacja przeniesienia wyników pomiarów czasowych na postać graficzną.

W pliku main.py znajduje się funkcja main, wywołująca prezentację rozwiązania.

W folderze results w pliku result.png znajduje się wygenerowany wykres zależności czasu wykonywania operacji na kopcach od ilości danych.

W folderze results w pliku results.json znajdują się wyniki zawierające wartości pomiarów czasu wykonywania operacji na kopcach, ilość danych, na których te operacje przeprowadzono i n-arność tych kopców.

W folderze results w plikach display_2.jpg, display_5.jpg i display_7.jpg znajdują się zrzuty ekranu z przykładami wyświetlania kopca.


## Opis środowiska
Implementacja i testowanie kodu przeprowadzone zostało, wykorzystując wersję 3.10.12 64-bit języka Python.
Projekt korzysta z następujących bibliotek zewnętrznych:
- matplotlib 3.8.3
- pytest 8.1.1
Oraz następujących bibliotek wewnętrznych:
- gc 
- time
- json
- random


## Procedura uruchomienia
W celu poprawnego działania projekt należy uruchomić poprzez plik main.py z głównego folderu repozytorium, wpisując w terminal "python3 Kopce/main.py". Jeśli kopiec wyświetla się w terminalu w sposób niepoprawny ze względu na włączone zawijanie wierszy, należy użyć w terminalu skrótu Alt+Z i uruchomić program ponownie.

## Podział zadań
Cała zawartość projektu była przez nas współtworzona na każdym etapie opracowywania, implementacji, refaktoryzacji oraz testowania rozwiązania.

## Podsumowanie wyników
Ze względu na losowość generowania się list wejściowych wartości pomiarów czasowych wahają się przy każdym wywołaniu programu. Wyraźnie widać jednak, że tworzenie się kopca trwa tym dłużej, im mniejszy jest stopień kopca. Wynika to z faktu, iż dla tej samej ilości elementów kopiec o mniejszym stopniu wymaga większej ilości pięter (levels), tym samym wymagając większej ilości porównań.

Przy pomiarach czasu wykonywania operacji usuwania elementów z kopca zauważyliśmy, że najlepszy czas osiągał kopiec stopnia 5-ego, a najgorszy stopnia 2-ego. Na czas wykonania operacji usuwania wpływa zarówno ilość poziomów (levels) kopca, jak i ilość "dzieci" na każdym z poziomów. 
Wygląda na to, że dla naszego algorytmu najlepszy balans między tymi dwoma parametrami osiąga kopiec stopnia 5-ego, co jest źródłem nieregularności na wykresie. 