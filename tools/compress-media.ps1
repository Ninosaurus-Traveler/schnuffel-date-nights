# =========================================================
# Medien für den Adventskalender komprimieren
#
# Voraussetzung: ffmpeg installiert (winget install Gyan.FFmpeg)
#
# Eingabe:  _media/raw/day-01/..., _media/raw/day-02/..., ...
# Ausgabe:  _media/out/day-01/... (+ Poster-JPGs für Videos)
#           und pro Tag ein fertiger "media"-JSON-Schnipsel für Supabase.
#
# Aufruf (im Repo-Ordner):  pwsh tools/compress-media.ps1
# _media/ steht in .gitignore und wird NIE committed.
# =========================================================

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$rawDir = Join-Path $root "_media/raw"
$outDir = Join-Path $root "_media/out"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  throw "ffmpeg nicht gefunden. Installieren mit: winget install Gyan.FFmpeg"
}
if (-not (Test-Path $rawDir)) {
  throw "Ordner $rawDir fehlt. Lege dort day-01, day-02, ... mit den Rohdateien an."
}

$videoExt = @(".mov", ".mp4", ".m4v")
$imageExt = @(".jpg", ".jpeg", ".png", ".webp")

# Dateinamen für Supabase Storage: nur a-z, 0-9, Bindestrich
function Get-SafeName([string]$name) {
  $n = $name.ToLower()
  $n = $n -replace "ä", "ae" -replace "ö", "oe" -replace "ü", "ue" -replace "ß", "ss"
  $n = $n -replace "[^a-z0-9]+", "-"
  return $n.Trim("-")
}

foreach ($dayDir in Get-ChildItem $rawDir -Directory | Where-Object Name -match "^day-\d{2}$" | Sort-Object Name) {
  $day = $dayDir.Name
  $target = Join-Path $outDir $day
  New-Item -ItemType Directory -Force $target | Out-Null
  $media = @()

  foreach ($file in Get-ChildItem $dayDir.FullName -File | Sort-Object Name) {
    $ext = $file.Extension.ToLower()
    $base = Get-SafeName $file.BaseName

    if ($videoExt -contains $ext) {
      $out = Join-Path $target "$base.mp4"
      $poster = Join-Path $target "$base.jpg"
      Write-Host "🎬 $day/$($file.Name)"

      # Kürzere Seite max. 720 px, H.264 + AAC, schneller Start beim Streamen
      ffmpeg -y -loglevel error -i $file.FullName `
        -vf "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'" `
        -c:v libx264 -preset slow -crf 26 -maxrate 2500k -bufsize 5000k `
        -pix_fmt yuv420p -profile:v high `
        -c:a aac -b:a 128k -movflags +faststart $out

      ffmpeg -y -loglevel error -ss 0.5 -i $out -frames:v 1 -q:v 3 $poster

      $media += [ordered]@{ type = "video"; path = "$day/$base.mp4"; poster = "$day/$base.jpg" }
    }
    elseif ($imageExt -contains $ext) {
      $out = Join-Path $target "$base.jpg"
      Write-Host "🖼️  $day/$($file.Name)"

      ffmpeg -y -loglevel error -i $file.FullName `
        -vf "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease" `
        -q:v 4 $out

      $media += [ordered]@{ type = "image"; path = "$day/$base.jpg" }
    }
    else {
      Write-Warning "Übersprungen (Format nicht unterstützt): $day/$($file.Name)"
    }
  }

  $json = ConvertTo-Json @($media) -Compress
  Set-Content -Path (Join-Path $target "media.json") -Value $json -Encoding utf8
}

Write-Host ""
Write-Host "Größen pro Tag:"
$total = 0
foreach ($d in Get-ChildItem $outDir -Directory | Sort-Object Name) {
  $size = (Get-ChildItem $d.FullName -File -Exclude "media.json" | Measure-Object Length -Sum).Sum
  $total += $size
  "{0}  {1,7:N1} MB" -f $d.Name, ($size / 1MB)
}
"GESAMT  {0,7:N1} MB   (Supabase Free: max. 1024 MB)" -f ($total / 1MB)
