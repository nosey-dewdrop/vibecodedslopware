#!/bin/zsh
# bak.sh — siteyi gerçek tarayıcıda çalıştırır, ölçer, ekran görüntüsü alır.
#
# Damla'nın gördüğü şeyi ben de göreyim diye. `curl` 200 dönüyor diye bir
# sayfanın iyi göründüğü sonucu çıkmıyor.
#
#   ./bak.sh            kur + kapı + ölç + görüntü
#
set -e
KOK=${0:a:h}
S=${SCRATCH:-/tmp}/vcs-bak
mkdir -p $S
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

cd $KOK
echo "· kuruluyor"
PATH=/usr/bin:/bin python3 kur.py 2>&1 | grep -v "og basıl\|chrome yok" | tail -3

echo "· Damla'nın talimatı"
python3 kontrol.py || { echo "  TALIMAT KAPISI KAPALI, push yok"; exit 1; }

pkill -f "http.server 8901" 2>/dev/null || true
sleep 1
python3 -m http.server 8901 --directory $KOK >/dev/null 2>&1 &
SUNUCU=$!
sleep 2

pkill -f "remote-debugging-port=9222" 2>/dev/null || true
sleep 1
"$CH" --headless=new --disable-gpu --remote-debugging-port=9222 \
      --user-data-dir=$S/prof --window-size=1680,1050 \
      "http://localhost:8901/slopware/localhost/" >/dev/null 2>&1 &
sleep 4

echo "· çalışan sayfa ölçülüyor"
node $S/../cdp.js 9222 $KOK/olcum.js 2>/dev/null || node ${CDP:-cdp.js} 9222 $KOK/olcum.js

echo "· ekran görüntüsü"
for yol in "slopware/localhost" "" "forum" "soru"; do
  ad=$(echo "${yol:-ana}" | tr '/' '-')
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1680,1050 \
        --screenshot=$S/$ad.png --virtual-time-budget=4000 \
        "http://localhost:8901/$yol/" >/dev/null 2>&1
done
echo "  $S/*.png"

kill $SUNUCU 2>/dev/null || true
pkill -f "remote-debugging-port=9222" 2>/dev/null || true
echo "· bitti"
