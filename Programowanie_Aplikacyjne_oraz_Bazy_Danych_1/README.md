# **Projekt PAP 2024Z-Z16**

### Skład zespołu
- Maciej Bogusławski (331362)
- Hubert Kaczyński (331386)
- Amadeusz Lewandowski (331397)
- Bartosz Żelazko (331457)

### Temat projektu
Projekt stanowi implementację desktopowej gry ekonomiczno-strategicznej "Habemus Rex!". Gra polega na zarządaniu państwem w roli XVIII-wiecznego króla elekcyjnego poprzez budowę infrastruktury, rekrutowanie jednostek wojskowych, podbijanie nowych ziem i sprawne gospodarowanie zasobami.

Gra oparta jest o technologie Java oraz JavaFX.

### Instalacja i uruchomienie w środowisku Linux
Do instalacji i poprawnego uruchomienia gry w środowisku Linuxowym potrzebny jest pakiet JDK Javy w wersji 21, a także oficjalna instalacja narzędzia Docker, zainstalowanego zgodnie z [oficjalną instrukcją](https://docs.docker.com/desktop/setup/install/linux/). Nieoficjalne instalacje Dockera mogą nie być obsługiwane.

Gra skompilowana została w formie Uber-JAR, dzięki czemu użytkownik nie musi manualnie instalować biblioteki JavaFX. Sama gra oparta jest na technologii JavaFX 21.0.5. 

W celu sklonowania repozytorium należy wykonać poniższe polecenie:
```
git clone https://gitlab-stud.elka.pw.edu.pl/bzelazko/pap2024z-z16.git
```

Po przejściu do katalogu głównego projektu w branchu `main`, całą instalację oraz uruchomienie gry wykonać można poprzez pojedyncze wywołanie skryptu `start.sh`:
```
./start.sh
```
**Uwaga**: Przed uruchomieniem skryptu, potrzebne może być nadanie odpowiednich uprawnień do pliku. W tym celu należy wykonać polecenie `chmod +x start.sh`.

Skrypt ten uruchamia bazę danych MySQL w kontenerze Docker, wypełnia ją danymi, oczekuje na połączenie z bazą, a następnie uruchamia grę. 


### Instalacja i uruchomienie w środowisku Windows

Instalacja i uruchomienie gry w środowisku Windows jest analogiczne do tego w środowisku Linuxowym. Wymagane jest posiadanie zainstalowanego JDK Javy w wersji 21 oraz narzędzia Docker, najlepiej w formie aplikacji Docker Desktop.

Po sklonowaniu repozytorium, należy przejść do katalogu głównego projektu w branchu `main` i uruchomić skrypt `start.bat`:
```
start.bat
```


### Prezentacja funkcjonalności prototypu (Etap II)

Poniższy film przedstawia instalację i uruchomienie gry, a także pokazuje funkcjonalności zaimplementowane w ramach Etapu II.

[![HABEMUS REX - PREZENTACJA PROTOTYPU](docs/Etap_II/HabemusRex_Video_Thumbnail.png)](https://www.youtube.com/watch?v=NOt--hrCztk "Habemus Rex! | Prezentacja Prototypu")