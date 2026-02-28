# **TipTap**

![Backend Tests](https://github.com/maciejb7/PZSP2-TipTap/actions/workflows/test-backend.yml/badge.svg)
![Frontend Tests](https://github.com/maciejb7/PZSP2-TipTap/actions/workflows/test-frontend.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.13-blue)
![React](https://img.shields.io/badge/react-19.1-blue)
![Vite](https://img.shields.io/badge/vite-7.1-blue)

Aplikacja wspierająca szkołę tańca w zarządzaniu ofertą oraz w realizacji bieżących zadań organizacyjnych.

Projekt tworzony w ramach przedmiotu Projekt Zespołowy 2 na Politechnice Warszawskiej.

## Spis treści

- [Funkcjonalności](#funkcjonalności)
- [Zespół](#zespół)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Technologie](#technologie)

## Funkcjonalności

- Tworzenie kont użytkowników (administratorzy, instruktorzy, uczniowie) z pomocą adresu e-mail i hasła.
- Weryfikacja adresu e-mail podczas rejestracji.
- Możliwość usuwania kont użytkowników przez administratora.
- Możliwość zdefiniowania przez administratora sal wraz z informacją o możliwości jej wynajmu.
- Możliwość zdefiniowania przez administratora poziomu zaawansowania zajęć wraz z opisem.
- Możliwość zdefiniowania przez administratora tematów zajęć wraz z opisem.
- Możliwość zdefiniowania przez administratora grup zajęciowych, wraz z przypisaniem sali, poziomu oraz tematu zajęć.
- Możliwość dodawania oraz edytowania przez administratora semestrów o określonej dacie rozpoczęcia oraz zakończenia.
- Możliwość nadawania użytkownikom roli instruktora lub administratora lub "degradowania" ich do domyślnej roli ucznia.
- Możliwość edycji oraz usuwania sal, poziomów zaawansowania, tematów zajęć, grup zajęciowych.
- Możliwość przypisywania instruktorów do określonych zajęć
- Wysyłanie powiadomień e-mail do użytkowników (np. potwierdzających rejestrację na zajęcia).
- Możliwość wyświetlenia planu zajęć dla zalogowanego użytkownika.
- Wyświetlanie dziennika obecności dla zalogowanego ucznia.
- Możliwość rejestrowania obecności uczniów na zajęciach przez instruktorów.
- Możliwość odznaczenia obecności uczniów "odrabiających" zajęcia przez instruktorów.
- Możliwość edycji zajęć w celu ręcznego oznaczania wyjątków w grafiku zajęć przez administratorów.
- Wyświetlanie uczniowi bieżącego stanu płatności oraz ewentualnych zaległości.
- Możliwość wprowadzenia informacji o płatnościach uczniów, zaległościach bądź nadpłatach przez administratorów.
- Możliwość generowania raportów dotyczących płatności oraz zaległości uczniów przez administratorów.
- Automatyczne wysyłanie przypomnień e-mail o należnościach do uczniów.
- Możliwość zmiany danych konta użytkownika (np. imienia, adresu e-mail) przez administratorów.
- Możliwość samodzielnej edycji danych konta przez uczniów.
- Możliwość zgłoszenia zastępstwa instruktora przez innego instruktora bez konieczności akceptacji administratora.
- Możliwość segregowania listy uczniów według grup zajęciowych przez administratorów.
- Możliwość sprawdzenia zaległości płatniczych uczniów przez administratorów.
- Mechanizm zapisów z prezentacją aktualnej liczby zapisanych osób w grupie.
- Funkcjonalność automatycznego zapisu na listę rezerwową w przypadku pełnej grupy.
- Możliwość filtrowania dostępnych zajęć według poziomu zaawansowania oraz tematu.
- Możliwość wypisania się z zajęć przez ucznia.
- Synchronizacja strony z bazą danych po każdej zmianie dokonanej przez administratora.
- Archiwizacja danych historycznych dotyczących zajęć, obecności i płatności.
- Prezentacja informacji o kontakcie w sprawie możliwości indywidualnego wynajmu sali.
- Wyświetlanie danych kontaktowych w sprawie indywidualnego wynajmu sali dla osób spoza szkoły.
- Możliwość wprowadzenia zmiany poziomów zaawansowania i zajęć tematycznych przez administratora.
- Integracja z kanałami social media szkoły w celu publikowania informacji o ofercie i zmianach.
- Wyświetlanie publicznego planu zajęć z liczbą miejsc w grupach.

## Zespół

- [Maciej Bogusławski](https://github.com/maciejb7)
- [Hubert Kaczyński](https://github.com/hkaczyns)
- [Amadeusz Lewandowski](https://github.com/alewand)
- [Bartosz Żelazko](https://github.com/barzelll)

## Instalacja i uruchomienie

Do uruchomienia aplikacji potrzebne jest zainstalowane środowisko [Docker](https://www.docker.com/). Następnie wykonaj poniższe kroki:

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/maciejb7/PZSP2-TipTap
   ```
2. Przejdź do katalogu projektu:
   ```bash
   cd PZSP2-TipTap
   ```
3. Zedytuj pliki `.env` oraz `server/.env.prod`, aby dostosować zmienne środowiskowe do swoich potrzeb.
4. Uruchom aplikację za pomocą Dockera:
   ```bash
   docker compose up
   ```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

Informacje dotyczące uruchomienia projektu w środowisku deweloperskim znaleźć można w folderze `docs`. Dokumentacja napisana jest w języku angielskim.

## Technologie

Projekt został zrealizowany przy użyciu następujących technologii:

### Frontend

![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Redux](https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white&style=for-the-badge)
![Jest](https://img.shields.io/badge/-Jest-C21325?logo=jest&logoColor=white&style=for-the-badge)

### Backend

![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=for-the-badge)
![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge)
![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-000000?logo=sqlalchemy&logoColor=white&style=for-the-badge)
![Alembic](https://img.shields.io/badge/-Alembic-2D2D2D?logo=alembic&logoColor=white&style=for-the-badge)
![Pydantic](https://img.shields.io/badge/-Pydantic-008080?logo=pydantic&logoColor=white&style=for-the-badge)
![Pytest](https://img.shields.io/badge/-Pytest-4B8BBE?logo=pytest&logoColor=white&style=for-the-badge)
![Ruff](https://img.shields.io/badge/-Ruff-000000?logo=ruff&logoColor=white&style=for-the-badge)
![Black](https://img.shields.io/badge/-Black-000000?logo=black&logoColor=white&style=for-the-badge)

### Baza danych

![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-316192?logo=postgresql&logoColor=white&style=for-the-badge)

### DevOps

![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)
![Github Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=github-actions&logoColor=white&style=for-the-badge)
![Postman](https://img.shields.io/badge/-Postman-FF6C37?logo=postman&logoColor=white&style=for-the-badge)

### Inne narzędzia

![Figma](https://img.shields.io/badge/-Figma-F24E1E?logo=figma&logoColor=white&style=for-the-badge)
![Namecheap](https://img.shields.io/badge/-Namecheap-0F9D58?logo=namecheap&logoColor=white&style=for-the-badge)
