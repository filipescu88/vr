# Orbital Garden · VR

Przykładowa scena WebXR w A-Frame 1.6.0: ogród na orbitalnej platformie, planeta z pierścieniami, gwiazdy i trzy kryształy do trafienia karabinkiem MOHAC z projektu Blender.

**Uruchom:** https://filipescu88.github.io/vr/

## Sterowanie

- Komputer: przeciągnij myszą, aby się rozejrzeć. Celuj wskaźnikiem myszy i klikaj, aby strzelać. Traf trzy kryształy, aby przywrócić energię centralnej rzeźbie. Przeciąganie widoku nie oddaje strzału.
- Telefon: przeciągnij widok palcem; stukaj w kryształy, aby strzelać.
- Teleportacja: kliknij jedno z czterech miętowych pól na podłodze.
- Gogle: otwórz stronę w przeglądarce obsługującej WebXR i wybierz przycisk VR. Karabinek jest przypięty do prawego kontrolera: celuj wzdłuż jasnej linii i naciskaj prawy spust. Lewy kontroler służy do teleportacji i resetu: celuj laserem i naciśnij lewy spust.
- Reset: przycisk „Zacznij od nowa” albo mała złota kula RESET pod centralną rzeźbą (również w VR).

## Lokalnie

W katalogu repo uruchom `python -m http.server 8080` i otwórz http://localhost:8080. Nie otwieraj pliku przez `file://`.

Tryb gogli wymaga HTTPS (GitHub Pages je zapewnia) albo localhost oraz zgodnej przeglądarki i urządzenia. Zwykły podgląd 3D działa też bez gogli. A-Frame pobierany jest z CDN, więc wymagane jest połączenie z internetem.

## Pliki

- `index.html`: scena, oświetlenie, kamera i kontrolery.
- `scene.js`: kryształy, postęp, teleportacja i proceduralny ogród.
- `shooting.js`: trafienia promieniem, błysk, smuga, odrzut i obsługa myszy oraz prawego kontrolera.
- `assets/mohac.glb`: model MOHAC wyeksportowany z `mohac_realistic.blend` w repo `filipescu88/blender`.
- `tools/export_rifle.py`: odtwarzalny eksport z Blendera, bez modyfikowania pliku źródłowego.
- `style.css`: polski interfejs na komputer i telefon.
- `original-example.html`: zachowana poprzednia scena eksperymentalna, bez zmian.
- `pilka3d/` i `Untitled.glb`: zachowane modele; nowa scena nie wymaga ich ładowania.

Publikacja korzysta z istniejącego GitHub Pages: gałąź `main`, katalog `/`. Bez kompilacji i instalowania pakietów.

Dokumentacja: https://aframe.io/docs/1.6.0/components/laser-controls.html

## Karabinek i trafienia

Model ma ok. 5,95 MB, 110 tys. trójkątów i 10 grup materiałów. Eksport zachowuje geometrię, kolory i materiały PBR; pomija studio oraz proceduralną mikrofakturę Blendera. Oryginalny plik `.blend` pozostaje bez zmian. Punkt mocowania znajduje się przy chwycie, lufa wskazuje lokalne -Z.

Jeden klik lub naciśnięcie spustu oddaje jeden strzał, z odstępem co najmniej 180 ms. Najbliższa przeszkoda zatrzymuje promień. Trafienie aktywuje kryształ tylko raz; reset zeruje kryształy i licznik strzałów. W VR nie ma automatycznego ruchu kamery ani odrzutu głowy.

## Sprawdzenie

`npm ci` i `npm test` uruchamiają testy logiki z rzeczywistymi przecięciami geometrii Three.js: trafienia, pudła, przeszkody, odstęp między strzałami, oś lufy w VR, reset i rozróżnienie kliknięcia od przeciągania. Pakiety są potrzebne wyłącznie do testów — GitHub Pages nadal serwuje statyczne pliki bez budowania.

Testy nie zastępują sprawdzenia na fizycznych goglach; pozycja chwytu może wymagać dostrojenia dla konkretnego kontrolera.
