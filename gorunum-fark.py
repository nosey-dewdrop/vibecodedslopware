#!/usr/bin/env python3
"""gorunum-fark.py taban.json yeni.json — iki olcumu karsilastirir.

CSS birlestirmenin tek kapisi. Cikti "0 / N" degilse degisiklik gorunumu
bozmus demektir; geri alinir. Kod okuyarak karar verilmez.
"""
import json, sys

def yukle(y):
    with open(y) as f: return json.load(f)

a, b = yukle(sys.argv[1]), yukle(sys.argv[2])
fark, toplam = [], 0
for tema in sorted(set(a["olcum"]) | set(b["olcum"])):
    ta, tb = a["olcum"].get(tema, {}), b["olcum"].get(tema, {})
    for sec in sorted(set(ta) | set(tb)):
        sa, sb = ta.get(sec), tb.get(sec)
        if sa is None and sb is None: continue
        if sa is None or sb is None:
            fark.append(f"{tema} · {sec} · SECICI {'YOK OLDU' if sb is None else 'BELIRDI'}")
            continue
        for oz in sorted(set(sa) | set(sb)):
            toplam += 1
            va, vb = sa.get(oz), sb.get(oz)
            if va != vb:
                fark.append(f"{tema} · {sec} · {oz}: {va}  ->  {vb}")

print(f"GORUNUM FARKI: {len(fark)} / {toplam}")
for f in fark: print("  " + f)
sys.exit(1 if fark else 0)
