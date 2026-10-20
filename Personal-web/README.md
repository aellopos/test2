# Osobní web – Michal Kučera

Statický web v čistém HTML, CSS a JS. Žádné knihovny ani build, stačí nahrát složku na hosting.

## Struktura

```
index.html                 obsah celé stránky (česky)
en/index.html              anglická verze (adresa /en/)
404.html                   stránka „nenalezeno“
robots.txt, sitemap.xml    pro vyhledávače
favicon.svg, favicon.ico   ikona v prohlížeči
assets/css/style.css       vzhled (barvy a písma jsou v :root nahoře)
assets/js/main.js          pohyb a interakce
assets/fonts/              Archivo + Newsreader, osekané na češtinu (licence OFL přiložena)
assets/img/                portrét v AVIF/WebP/JPEG (480, 800, 1200 px), náhled pro sdílení, ikona pro iPhone
assets/img/logos/          loga partnerů v originálních barvách (SVG); na webu jsou vložená přímo do HTML
```

## Spuštění

Otevři `index.html` v prohlížeči. Pro věrné chování (fonty, obrázky) je lepší lokální server,
např. `npx serve .` nebo `python3 -m http.server` ve složce webu.

## Nasazení

Web je připravený pro adresu **https://www.michalkucera.com/** (canonical, náhled pro sociální sítě,
strukturovaná data, `robots.txt`, `sitemap.xml`). Když se adresa změní, nahraď ji ve všech těchto souborech
(stačí hledat `michalkucera.com`): `index.html`, `en/index.html`, `robots.txt`, `sitemap.xml`.

- Nahraj obsah složky do kořene webu (aby `index.html` byl na `/`). Soubor `README.md` nahrávat nemusíš.
- `404.html` je stránka „nenalezeno“. Většina hostingů (Netlify, Vercel, GitHub Pages, Cloudflare Pages)
  ji použije sama, jinde ji nastav v administraci.
- Zapni na hostingu HTTPS a přesměrování z `michalkucera.com` na `www.michalkucera.com` (nebo naopak, ale jen jednu variantu).
- Zapni kompresi (gzip/brotli) a dlouhou cache pro `assets/` (fonty, obrázky, CSS, JS). Na Netlify, Vercelu
  a Cloudflare je to zapnuté automaticky.
- Po spuštění přidej web do Google Search Console a odešli `sitemap.xml`.
- Náhled odkazu na LinkedInu ověříš v LinkedIn Post Inspectoru (vlož adresu webu).
- Při větší úpravě obsahu změň datum `lastmod` v `sitemap.xml` a `dateModified` ve strukturovaných datech v `index.html`.

## Dvě jazykové verze

- Česká verze je `index.html`, anglická `en/index.html`. Obsah je ve dvou souborech, takže **změnu textu udělej v obou**.
- Přepínač CZ/EN je v horní liště (desktop) a v mobilním menu.
- Obě verze se navzájem odkazují přes `hreflang` (Google tak zobrazí správnou jazykovou verzi) a jsou v `sitemap.xml`.
- Anglická verze má vlastní náhled pro sdílení `assets/img/og-image-en.jpg`.

## Úpravy obsahu

- Texty jsou přímo v `index.html`: úvod, Kdo jsem, Čemu se věnuji, S kým spolupracuji, Ocenění, Kontakt.
- Ocenění: odznaky z Credly ve skupinách `.awards__group`. Obrázky se načítají přímo z `images.credly.com`
  a každý odznak odkazuje na své ověření na Credly. Nový odznak = zkopíruj jedno `<li>` a uprav název, rok, odkaz a obrázek.
- Zvýraznění žlutou fixou:
  - v běžném textu na světlém pozadí: `<mark class="hl">text</mark>` (může mít víc řádků),
  - kdekoli jinde: `<span class="mk" data-text="slovo">slovo</span>` (jeden řádek, `data-text` musí být stejný jako text).
- Obory v sekci Čemu se věnuji: seznam `.topics`. Každý obor je rozklikávací `<details class="topic__item">`:
  v `<summary>` je název (zvýraznění `.mk`), uvnitř `.topic__desc` (krátký popis) a `.topic__tools`
  (nástroje jako štítky, každý `<li style="--i: N">`, kde N je pořadí kvůli postupnému zobrazení).
- Loga partnerů: seznam `.partners`. Každé logo je SVG vložené přímo do odkazu (funguje i při otevření
  souboru bez serveru). Nové logo: obsah SVG z `assets/img/logos/` vlož do `<a class="partner">`,
  přidej mu `class="partner__logo"` a `style="--h: 30"` (relativní výška; větší číslo = větší logo).
- Česká typografie: v HTML jsou nezlomitelné mezery (`&nbsp;`) po jednopísmenných předložkách a spojkách;
  `main.js` je pro jistotu doplní i do textů, které upravíš později.

## Co web umí

- Úvodní sekvence při načtení, zvýrazňovač, který „dopíše“ podtržené pasáže, když na ně čtenář dojede.
- Hlavička ukazuje, kolik z každé sekce už návštěvník přečetl (název sekce se postupně zvýrazňuje).
- V sekci Čemu se věnuji se obor zvýrazní žlutou fixou po najetí myší (a u otevřeného oboru).
  Obory se dají rozkliknout (vždy jen jeden naráz) a fungují i bez JavaScriptu.
- U kontaktu fixa nejdřív přejede přes nadpis a pak se rozlije přes celou plochu.
- Respektuje `prefers-reduced-motion` (bez animací vše rovnou ve finálním stavu) a funguje i bez JavaScriptu.
- Otestováno v Chromiu na šířkách 320–1920 px, bez vodorovného přetékání; axe-core bez nálezů.
