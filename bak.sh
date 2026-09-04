#!/bin/zsh
# bak.sh — kur, kapıyı koş, çalışan sayfayı ölç, ekran görüntüsü al.
#
# Damla'nın gördüğü şeyi ben de göreyim diye. `curl` 200 dönüyor diye bir
# sayfanın iyi göründüğü sonucu çıkmıyor; bu oturumun en pahalı dersi buydu.
#
#   ./bak.sh            hepsi
#
set -e
KOK=${0:a:h}
CIKTI=${1:-/tmp/vcs-bak}
mkdir -p $CIKTI
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cd $KOK

echo "· kuruluyor"
# PATH kısıtı Chrome'u gizler: pdf üretimi 90 saniye takılıyor.
PATH=/usr/bin:/bin python3 kur.py 2>&1 | grep -v "og basıl\|chrome yok" | tail -3

echo "· Damla'nın talimatı"
python3 kontrol.py || { echo "  KAPI KAPALI — push yok"; exit 1; }

pkill -f "http.server 8901" 2>/dev/null || true
sleep 1
python3 -m http.server 8901 --directory $KOK >/dev/null 2>&1 &
SUNUCU=$!
sleep 2

pkill -9 -f "Google Chrome" 2>/dev/null || true
sleep 2
rm -rf $CIKTI/prof
"$CH" --headless=new --disable-gpu --remote-debugging-port=9222 \
      --user-data-dir=$CIKTI/prof --window-size=1680,1050 \
      "http://localhost:8901/slopware/localhost/" >/dev/null 2>&1 &
sleep 5

echo "· çalışan sayfa"
node $KOK/cdp.js 9222 $KOK/olcum.js || true

pkill -9 -f "Google Chrome" 2>/dev/null || true
sleep 2

# Dar ekran: telefonda sayfa bir kere 947px genişlemişti, ekran 390.
# mobil.js repoda duruyordu ama hiçbir yerden koşulmuyordu.
echo "· dar ekran (390px)"
rm -rf $CIKTI/prof-mobil
"$CH" --headless=new --disable-gpu --remote-debugging-port=9222 \
      --user-data-dir=$CIKTI/prof-mobil --window-size=390,844 \
      "http://localhost:8901/slopware/localhost/" >/dev/null 2>&1 &
sleep 5
node $KOK/cdp.js 9222 $KOK/mobil.js || true
pkill -9 -f "Google Chrome" 2>/dev/null || true
sleep 2

echo "· ekran görüntüsü"
for yol in "slopware/localhost" "" "slopware" "forum" "soru" "ara"; do
  ad=$(echo "${yol:-ana}" | tr '/' '-')
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1680,1050 \
        --screenshot=$CIKTI/$ad.png --virtual-time-budget=4000 \
        "http://localhost:8901/$yol/" >/dev/null 2>&1 || true
done
echo "  $CIKTI/*.png  — BUNLARA BAK, sonra push et"

kill $SUNUCU 2>/dev/null || true
echo "· bitti"
