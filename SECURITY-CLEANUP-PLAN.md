# Plan czyszczenia historii git — elektroapp-preview

## Kontekst
`index.html` był publicznie serwowany (GitHub Pages) i zawierał w kodzie źródłowym
realne dane firmy: nazwiska i telefony pracowników, nazwy/adresy klientów, kwoty
finansowe per projekt, precyzyjne współrzędne GPS i kody dostępu do 19 budynków,
oraz PIN właściciela. Branch `security-fixes-2026-07` naprawia to w **aktualnym**
stanie pliku (HEAD), ale historia commitów (45 commitów dotykających `index.html`,
2026-07-09 → dziś) nadal zawiera te dane w każdym wcześniejszym snapshotcie —
`git log -p` albo widok historii commitów na GitHubie nadal je pokazuje.

## Co zostało zweryfikowane
Zbudowałem i przetestowałem `git filter-repo --replace-text` na **lokalnej kopii
lustrzanej** repozytorium (nie na prawdziwym `origin`) i potwierdziłem, że po
przepisaniu historii żaden z poniższych fingerprintów nie występuje już w żadnym
z 45 historycznych snapshotów pliku:

- realne numery telefonów (`48884943058`, `48576144228`, `883 449 233`)
- realne kody dostępu do budynków (14 unikalnych wartości, w tym z literałem „KLUCZ”)
- precyzyjne współrzędne GPS (dokładność ~metr, `BLOK_GEO`, 19 par)
- realne adresy/nazwy budynków (Siedlce — 19 obiektów)
- realne imiona pracowników i właściciela (w tym poza polami JSON — np.
  zahardkodowany tekst powitania „Dzień dobry, Karol” i wyrenderowany fragment
  HTML z „Maciek Sosna” jako zwykły tekst, nie pole danych)
- realne nazwy klientów/projektów (Mariusz, Chomka, Pieczarkami Cabaj, Skwara
  warszawa, Szkoła Dąbrowska stany, Szkoła grala dąbrowizna, Wspólnoty, Borki
  kosy 29, Szkoła skórzec, Wewnetrzny) — w tym te same nazwy powtórzone w opisach
  wydatków (`wydatki.opis`)
- PIN właściciela `2580` (w dwóch miejscach: JSON `MIGRACJA_APPSHEET` i osobny
  JS-literałowy martwy kod w `DATA.uzytkownicy.u0`)

Reguły podmian: `replacements.txt` (129 par `stary_tekst==>nowy_tekst`), budowane
skryptem `build_replacements.py` — oba pliki w scratchpadzie tej sesji, mogę je
udostępnić na żądanie.

Jedyne pozostałe dopasowanie „Siedlce” to niegroźny tekst podpowiedzi w formularzu
(`placeholder="np. Elektrohurt Siedlce"`) — przykładowa podpowiedź UI, nie dane.

## Jak to wykonać naprawdę (nie zostało jeszcze zrobione na origin)

Przepisanie historii + wymuszony push to operacja nieodwracalna i widoczna dla
każdego, kto już sklonował repo — wymaga Twojej wyraźnej zgody przed wykonaniem
na prawdziwym `origin`. Kroki:

```bash
# 1. Świeży, izolowany klon (nie Twoja robocza kopia)
git clone https://github.com/karol50kt-debug/elektroapp-preview.git /tmp/cleanup
cd /tmp/cleanup

# 2. Zainstaluj git-filter-repo (Python, pip)
pip3 install git-filter-repo

# 3. Zastosuj zweryfikowane reguły podmian
git-filter-repo --replace-text /ścieżka/do/replacements.txt --force

# 4. Wypchnij przepisaną historię (WYMUSZONE — nadpisuje wszystkie gałęzie zdalne)
git remote add origin https://github.com/karol50kt-debug/elektroapp-preview.git
git push origin --force --all
git push origin --force --tags
```

**Zanim to zrobisz:**
1. Upewnij się, że merge `security-fixes-2026-07` → `main` już się odbył (rewrite
   historii najlepiej robić raz, na już scalonym stanie).
2. Poinformuj każdego, kto ma lokalny klon tego repo (jeśli ktoś jeszcze ma), że
   musi zrobić `git fetch && git reset --hard origin/main` po przepisaniu —
   stare klony będą rozjechane z nową historią.
3. GitHub może jeszcze przez chwilę cache'ować stare commity w linkach
   bezpośrednich (permalink do konkretnego SHA) — to normalne i mija po pewnym
   czasie / można poprosić GitHub Support o wyczyszczenie cache dla bardzo
   wrażliwych przypadków.
4. **Zrotuj realne kody dostępu i PIN-y niezależnie od tego kroku** — samo
   wyczyszczenie historii nie unieważnia kodów, które ktoś już mógł zobaczyć.
