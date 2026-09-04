#!/bin/zsh
# olc-gorunum.sh <cikti.json> [yol] — kurulu siteyi acar, gorunum.js kosturur.
# yol verilmezse slopware/localhost/ olculur (varsayilan bolum sayfasi).
# CSS degistirmeden ONCE ve SONRA kosulur; iki json diff'lenir.
set -e
KOK=${0:a:h}
HEDEF=${1:?kullanim: ./olc-gorunum.sh cikti.json [yol]}
YOL=${2:-slopware/localhost/}
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cd $KOK
PATH=/usr/bin:/bin python3 kur.py >/dev/null 2>&1
pkill -f "http.server 8902" 2>/dev/null || true
sleep 1
python3 -m http.server 8902 --directory $KOK >/dev/null 2>&1 &
SUNUCU=$!
sleep 2
pkill -9 -f "Google Chrome" 2>/dev/null || true
sleep 2
P=$(mktemp -d)
"$CH" --headless=new --disable-gpu --remote-debugging-port=9223 \
      --user-data-dir=$P --window-size=1680,1050 \
      "http://localhost:8902/$YOL" >/dev/null 2>&1 &
sleep 5
node $KOK/cdp.js 9223 $KOK/gorunum.js > $HEDEF
pkill -9 -f "Google Chrome" 2>/dev/null || true
kill $SUNUCU 2>/dev/null || true
rm -rf $P
python3 -c "import json,sys;d=json.load(open('$HEDEF'));print('  olculen deger:',d['deger'])"
