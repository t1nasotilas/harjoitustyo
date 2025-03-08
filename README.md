# Space Invaders

  Klassiseen Space Invaders -peliin perustuva selainpeli, jossa pelaaja puolustaa maata hyökkääviltä avaruusolioilta.


  Pelin tavoitteena on tuhota kaikki viholliset keräten pisteitä, välttäen samalla vihollisten ammuksia. Vaikeustaso nousee ajan myötä, ja pelissä on mahdollisuus aloittaa alusta.

## Ominaisuudet
- **Liikkuminen**: Nuolinäppäimet vasemmalle/oikealle.
- **Ampuminen**: Välilyönti.
- **Vaikeustaso**: Vihollisryhmien määrä ja nopeus kasvavat asteittain.
- **Pistelaskuri**: Pisteet näkyvät ruudun alalaidassa.
- **Resetointi**: Pelin voi aloittaa uudestaan napilla "ALOITA ALUSTA".
- **Responsiivisuus**: Soveltuu eri näyttökokoihin.
  
## Asennus ja käyttöönotto
1. Lataa projektin tiedostot.
2. Varmista, että kansiorakenne on:

├── index.html

├── game.html

├── kuvat/

│   ├── invader.png

│     └── spaceship.png

├── script/

│ └── invaders.js

└── style/

├── etusivu.css

└── sinvaders.css

3. Avaa `index.html` selaimessa (Chrome/Firefox suositeltu).

**Huom!** Projekti käyttää ulkoisia kirjastoja (Bootstrap, Google Fonts), jotka ladataan netistä. Varmista internetyhteys.

## Käyttöohjeet
1. Klikkaa "Space invaders" -linkkiä aloittaaksesi pelin.
2. Ohjaa alusta nuolinäppäimillä ja ammu välilyönnillä.
3. Vältä vihollisten ammuksia ja tuhoa kaikki UFOt.

## Rakenne
- **index.html**: Etusivu.
- **game.html**: Täältä löytyy pelin canvas.
- **invaders.js**: Pelilogiikka.
- **etusivu.css**: Etusivun tyylit.
- **sinvaders.css**: Pelin tyylit.
