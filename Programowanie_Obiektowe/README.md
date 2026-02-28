# Maciej Bogusławski, Hubert Kaczyński - Szpady i Zwady (Projekt PROI 24L)

*Pełna dokumentacja projektowa w języku polskim i angielskim wraz z poradnikiem do gry znajduje się w folderze **docs**.*

## Wstęp
Projekt stanowi implementację prostej gry RPG, w której gracz wciela się w rolę postaci mającej za zadanie uratować królestwo Dobrogrodu. W tym celu bohater musi zgładzić bandę rzezimieszków nurtujących miasto i odnaleźć księżniczkę. W ramach projektu zaimplementowaliśmy szereg funkcjonalności znanych z gier RPG i umożliwiających sprawdzenie się w zakresie programowania obiektowego. Za główny cel postawiliśmy sobie zapewnienie uniwersalności kodu poprzez rozbudowaną hierarchię klas, co znacząco ułatwia ewentualne dodawanie nowych misji i funkcjonalności w przyszłości. Projekt oparty jest o bibliotekę multimedialną Simple and Fast Multimedia Library (**SFML**).


## Informacje techniczne
- Wymagane miejsce na dysku: 171 MiB
- Minimalna rozdzielczość ekranu: 1920x1080px
- Minimalna częstotliwość odświeżania monitora: 60Hz

## Instalacja i uruchomienie
W celu poprawnego uruchomienia gry w środowisku WSL należy zainstalować bibliotekę multimedialną Simple and Fast Multimedia Library (SFML). W tym celu rekomendujemy wykonanie następującej komendy w terminalu:

```
sudo apt-get install libsfml-dev
```

Po instalacji biblioteki należy skompilować program. Reguły kompilacji zawarte zostały w katalogu głównym w pliku makefile. Dzięki temu w celu kompilacji programu wystarczy jedynie wykonać następującą komendę w terminalu:

```
make
```

Z uwagi na dużą liczbę plików źródłowych kompilacja potrwać może kilkadziesiąt sekund. Po poprawnej kompilacji gra powinna być gotowa do uruchomienia z pomocą komendy:

```
./main
```

## Opis środowiska
Implementacja programistyczna i testowanie projektu przeprowadzone zostały, wykorzystując język C++ 17 oraz bibliotekę Simple and Fast Multimedia Library (SFML) w wersji 2.5.1.

## Podział zadań
Na każdym etapie projektowania, implementacji, testowania oraz tworzenia prac graficznych i dialogów, zadania wykonywaliśmy wspólnie lub dzieliliśmy się nimi, składając nasze rozwiązania w jedną całość.

*Dalsza część dokumentacji wraz z istotną informacją dotyczącą wycieków pamięci oraz pełnym poradnikiem do gry znajduje się w folderze docs.*