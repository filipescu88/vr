# Orbital Garden · VR

Przykładowa scena WebXR w A-Frame 1.6.0: ogród na orbitalnej platformie, planeta z pierścieniami, gwiazdy i trzy interaktywne kryształy.

**Uruchom:** https://filipescu88.github.io/vr/

## Sterowanie

- Komputer: przeciągnij myszą, aby się rozejrzeć. Klikaj kryształy, aby przywrócić energię centralnej rzeźbie.
- Telefon: przeciągnij widok palcem; dotykaj obiektów, aby je aktywować.
- Teleportacja: kliknij jedno z czterech miętowych pól na podłodze.
- Gogle: otwórz stronę w przeglądarce obsługującej WebXR i wybierz przycisk VR. Celuj laserem kontrolera i naciśnij spust, aby aktywować kryształ lub teleportować się.
- Reset: przycisk „Zacznij od nowa” albo mała złota kula RESET pod centralną rzeźbą (również w VR).

## Lokalnie

W katalogu repo uruchom `python -m http.server 8080` i otwórz http://localhost:8080. Nie otwieraj pliku przez `file://`.

Tryb gogli wymaga HTTPS (GitHub Pages je zapewnia) albo localhost oraz zgodnej przeglądarki i urządzenia. Zwykły podgląd 3D działa też bez gogli. A-Frame pobierany jest z CDN, więc wymagane jest połączenie z internetem.

## Pliki

- `index.html`: scena, oświetlenie, kamera i kontrolery.
- `scene.js`: kryształy, postęp, teleportacja i proceduralny ogród.
- `style.css`: polski interfejs na komputer i telefon.
- `original-example.html`: zachowana poprzednia scena eksperymentalna, bez zmian.
- `pilka3d/` i `Untitled.glb`: zachowane modele; nowa scena nie wymaga ich ładowania.

Publikacja korzysta z istniejącego GitHub Pages: gałąź `main`, katalog `/`. Bez kompilacji i instalowania pakietów.

Dokumentacja: https://aframe.io/docs/1.6.0/components/laser-controls.html
