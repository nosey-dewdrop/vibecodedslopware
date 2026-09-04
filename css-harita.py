#!/usr/bin/env python3
"""css-harita.py — aynı seçici kaç yerde tanımlı, hangi değer kazanıyor?

    python3 css-harita.py

Bir seçicinin stilini değiştirmek isteyip de değişikliğin tutmadığını
gördüğünde buraya bak: büyük ihtimalle o özellik başka bir satırda bir
daha tanımlanmış ve seninki eziliyor.

Bu dosya hiçbir şeyi DEĞİŞTİRMEZ, sadece gösterir. Otomatik birleştirme
bir kere denendi ve hover balonunu bozdu (z-index 60'tan 40'a düştü);
birleştirme elle, ölçerek yapılır.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

KOK = Path(__file__).parent


def kurallar(s):
    """Media bloğu DIŞINDAKİ (seçici, gövde, satır) üçlüleri."""
    out, i, n, satir = [], 0, len(s), 1
    while i < n:
        if s[i:i + 2] == '/*':
            j = s.find('*/', i + 2)
            j = n if j < 0 else j + 2
            satir += s.count('\n', i, j)
            i = j
            continue
        if s[i] == '@':
            j = i
            while j < n and s[j] not in '{;':
                j += 1
            if j < n and s[j] == '{':
                d, k = 1, j + 1
                while k < n and d:
                    if s[k] == '{':
                        d += 1
                    elif s[k] == '}':
                        d -= 1
                    k += 1
                satir += s.count('\n', i, k)
                i = k
                continue
            satir += s.count('\n', i, j + 1)
            i = j + 1
            continue
        if s[i] == '{':
            b = max(s.rfind('}', 0, i), s.rfind('*/', 0, i), s.rfind(';', 0, i)) + 1
            sec = " ".join(re.sub(r'/\*.*?\*/', '', s[b:i], flags=re.S).split())
            j = s.find('}', i)
            out.append((sec, s[i + 1:j], satir))
            satir += s.count('\n', i, j + 1)
            i = j + 1
            continue
        if s[i] == '\n':
            satir += 1
        i += 1
    return out


def bildirimler(gov):
    """[(anahtar, değer, önemli_mi)] — yorumları eleyerek."""
    out = []
    for par in re.sub(r'/\*.*?\*/', '', gov, flags=re.S).split(';'):
        if ':' not in par:
            continue
        k, v = par.split(':', 1)
        k = k.strip()
        if k and not k.startswith('@'):
            out.append((k, v.strip().replace('!important', '').strip(),
                        '!important' in v))
    return out


def main():
    toplam = 0
    for ad in ('tema/kabuk.css', 'tema/kitap.css', 'tema/gece.css'):
        yol = KOK / ad
        if not yol.exists():
            continue
        s = yol.read_text(encoding='utf-8')
        yer = defaultdict(list)
        for sec, gov, ln in kurallar(s):
            if sec:
                yer[sec].append((ln, gov))

        satirlar = []
        for sec, v in sorted(yer.items()):
            if len(v) < 2:
                continue
            oz = defaultdict(list)
            for ln, gov in v:
                for k, deger, onemli in bildirimler(gov):
                    oz[k].append((ln, deger, onemli))
            cakisan = {k: x for k, x in oz.items()
                       if len(x) > 1 and len({d for _, d, _ in x}) > 1}
            if not cakisan:
                continue
            satirlar.append((sec, len(v), cakisan))

        if not satirlar:
            print(f"{ad}: çakışma yok")
            continue

        n = sum(len(c) for _, _, c in satirlar)
        toplam += n
        print(f"\n{'=' * 70}\n{ad}: {len(satirlar)} seçici, {n} çakışan özellik\n{'=' * 70}")
        for sec, kac, cakisan in sorted(satirlar, key=lambda x: -len(x[2])):
            print(f"\n  {sec}")
            print(f"    {kac} yerde tanımlı")
            for k, x in cakisan.items():
                onemliler = [y for y in x if y[2]]
                kaz = onemliler[-1] if onemliler else x[-1]
                for ln, deger, onemli in x:
                    im = " !important" if onemli else ""
                    ok = "KAZANAN <-" if (ln, deger, onemli) == kaz else ""
                    print(f"      s{ln:<5} {k}: {deger}{im}  {ok}")
    print(f"\ntoplam çakışan özellik: {toplam}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
