# Schnuffels Adventskalender 🎄

Reines HTML/CSS/JS ohne Build-Step, gehostet auf GitHub Pages, Inhalte in Supabase.
Die alte Geburtstags-/Date-Nights-App ist gesichert als Tag `v1-geburtstag` und Branch `archive/geburtstag`.

## Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Die App (einzige echte Seite) |
| `css/advent.css` | Design, Raster-Anordnung der 24 Türchen, Animationen |
| `js/calendar.js` | Raster, Status, Countdown, Antippen |
| `js/door.js` | Türchen-Ansicht: Galerie, Brief, Wischen, Konfetti |
| `js/supabase.js` | Supabase-Client + Datenzugriff |
| `js/demo.js` | Demo-Modus mit Platzhaltern |
| `supabase/schema.sql` | Tabelle, Sperre (RLS), Storage-Bucket |
| `tools/compress-media.ps1` | Videos/Fotos komprimieren |
| alte `*.html` | Nur noch Weiterleitungen auf `index.html` (falls das Homescreen-Icon auf eine Unterseite zeigt) |

## Die Sperre

Jedes Türchen öffnet um **00:00 Uhr Sri-Lanka-Zeit** (= 19:30 Uhr deutsche Zeit am Vorabend).
Supabase liefert Texte und Signed URLs für Medien erst ab diesem Zeitpunkt aus (Row Level Security).
Im Code des (öffentlichen) Repos stehen keine Inhalte.

## Einrichtung (einmalig)

1. Supabase Dashboard → SQL Editor → Inhalt von `supabase/schema.sql` ausführen.
2. Kontrolle: Storage → Bucket `advent` existiert und ist **nicht** public.

## Inhalte vorbereiten

1. Rohdateien ablegen: `_media/raw/day-01/`, `_media/raw/day-02/`, …
   (Fotos als JPG, WhatsApp macht das automatisch. iPhone-Videos am besten als „Kompatibel“ bzw. ohne HDR, sonst wirken die Farben blass.)
2. `pwsh tools/compress-media.ps1` ausführen (braucht `winget install Gyan.FFmpeg`).
   Das Skript zeigt am Ende die Größe pro Tag. Ziel: gesamt unter ~600 MB.
3. Supabase → Storage → `advent`: Ordner `day-01` usw. anlegen und die Dateien aus `_media/out/day-XX/` hochladen (ohne `media.json`).
4. Supabase → SQL Editor, pro Tag:

   ```sql
   update public.advent_doors set
     title   = 'Grüße aus der Heimat',
     sender  = 'Mama & Papa',
     message = 'Wir vermissen dich! ☀️',
     media   = '<Inhalt von _media/out/day-01/media.json>'::jsonb
   where day = 1;
   ```

Die Reihenfolge in `media` bestimmt die Reihenfolge in der Galerie.

## Testen

- **Lokal:** `python -m http.server 8000` im Repo-Ordner starten, dann `http://localhost:8000/`.
  Auf dem iPhone (gleiches WLAN): `http://<PC-IP>:8000/`.
- **Demo-Modus** (ohne Supabase, mit Platzhaltern): `?demo` (= 8. Dezember), `?demo=17`, `?demo=24`, `?demo=0` (vor dem Start).
- **Echte Sperre testen:** siehe Abschnitt „TESTEN“ am Ende von `supabase/schema.sql`.
  Danach die Termine unbedingt wieder zurücksetzen!

## Go-Live (30.11.)

```bash
git switch main
git merge advent
git push origin main
```

Danach 1–5 Minuten warten, bis GitHub Pages deployt hat, und auf dem eigenen iPhone prüfen.
Vorher kontrollieren, dass das Supabase-Projekt nicht pausiert ist.
