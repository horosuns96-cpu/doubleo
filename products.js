// Shared product catalog for index + catalog pages
// Used by cart.js and catalog.html

window.CATEGORIES = [
  { id: 'all',          label: 'Усі товари' },
  { id: 'coffee',       label: 'Кава' },
  { id: 'puree',        label: 'Пюре' },
  { id: 'cups-pp',      label: 'Стакани PP' },
  { id: 'cups-paper',   label: 'Паперові стакани' },
  { id: 'syrups',       label: 'Сиропи' },
  { id: 'concentrates', label: 'Концентрати' },
  { id: 'extras',       label: 'Витратка' },
];

window.PRODUCTS = [
  // ================= COFFEE — Prima Italiano =================
  { id: 'coffee-decaf-250', cat: 'coffee', name: 'Prima Italiano — Decaf', subtitle: '100% Arabica · без кофеїну', unit: '250 г · уп', photo: 'assets/product-01.jpg' },
  { id: 'coffee-oro-250',   cat: 'coffee', name: 'Prima Italiano — Oro',    subtitle: '80% Arabica / 20% Robusta',     unit: '250 г · уп', photo: 'assets/product-01.jpg' },
  { id: 'coffee-rosso-250', cat: 'coffee', name: 'Prima Italiano — Rosso',  subtitle: '50% Arabica / 50% Robusta',     unit: '250 г · уп', photo: 'assets/product-01.jpg' },
  { id: 'coffee-oro-1kg',   cat: 'coffee', name: 'Prima Italiano — Oro',    subtitle: '80/20 · зернова · HoReCa',       unit: '1 кг · уп',  photo: 'assets/product-01.jpg' },
  { id: 'coffee-rosso-1kg', cat: 'coffee', name: 'Prima Italiano — Rosso',  subtitle: '50/50 · зернова · HoReCa',       unit: '1 кг · уп',  photo: 'assets/product-01.jpg' },

  // ================= PUREE — Ellenbar =================
  { id: 'puree-watermelon', cat: 'puree', name: 'Ellenbar · Кавун',        subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-strawberry', cat: 'puree', name: 'Ellenbar · Полуниця',     subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-mango',      cat: 'puree', name: 'Ellenbar · Манго',        subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-passion',    cat: 'puree', name: 'Ellenbar · Маракуйя',     subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-raspberry',  cat: 'puree', name: 'Ellenbar · Малина',       subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-mint',       cat: 'puree', name: 'Ellenbar · М\'ята',       subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-starfruit',  cat: 'puree', name: 'Ellenbar · Карамбола',    subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-grapefruit', cat: 'puree', name: 'Ellenbar · Грейпфрут',    subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-lemongrass', cat: 'puree', name: 'Ellenbar · Лемонграс',    subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-pineapple',  cat: 'puree', name: 'Ellenbar · Ананас',       subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },
  { id: 'puree-coconut',    cat: 'puree', name: 'Ellenbar · Кокос',        subtitle: 'натуральне пюре',            unit: '900 г · уп', photo: 'assets/product-02.jpg' },

  // ================= PP CUPS (купольні) =================
  { id: 'cup-pp-360', cat: 'cups-pp', name: 'Купольний PP стакан 360 мл', subtitle: '10.5 г · з кришкою-поїлкою',   unit: '50 шт · уп',   photo: 'assets/product-03.jpg' },
  { id: 'cup-pp-500', cat: 'cups-pp', name: 'Купольний PP стакан 500 мл', subtitle: '15.2 г · D-90',                unit: '50 шт · уп',   photo: 'assets/product-03.jpg' },
  { id: 'cup-pp-600', cat: 'cups-pp', name: 'Купольний PP стакан 600 мл', subtitle: '17 г · для bubble tea',        unit: '50 шт · уп',   photo: 'assets/product-03.jpg' },
  { id: 'cup-pp-700', cat: 'cups-pp', name: 'Купольний PP стакан 700 мл', subtitle: '22 г · преміум',               unit: '50 шт · уп',   photo: 'assets/product-03.jpg' },
  { id: 'cup-pp-lid', cat: 'cups-pp', name: 'Кришка D-90 з отвором', subtitle: 'під трубочку · універсальна',       unit: '100 шт · уп',  photo: 'assets/product-03.jpg' },

  // ================= PAPER CUPS — Graphite =================
  { id: 'cup-paper-175', cat: 'cups-paper', name: 'Graphite Cup 175 мл', subtitle: '2-шарові · асорті 5 кольорів', unit: '50 шт · уп', photo: 'assets/product-06.jpg' },
  { id: 'cup-paper-250', cat: 'cups-paper', name: 'Graphite Cup 250 мл', subtitle: '2-шарові · асорті 5 кольорів', unit: '50 шт · уп', photo: 'assets/product-06.jpg' },
  { id: 'cup-paper-340', cat: 'cups-paper', name: 'Graphite Cup 340 мл', subtitle: '2-шарові · асорті 5 кольорів', unit: '50 шт · уп', photo: 'assets/product-06.jpg' },
  { id: 'cup-paper-lid-black', cat: 'cups-paper', name: 'Кришка чорна', subtitle: 'для Graphite Cup · пластик', unit: '100 шт · уп', photo: 'assets/product-06.jpg' },
  { id: 'cup-paper-lid-white', cat: 'cups-paper', name: 'Кришка біла',  subtitle: 'для Graphite Cup · пластик', unit: '100 шт · уп', photo: 'assets/product-06.jpg' },

  // ================= SYRUPS — Maribell =================
  { id: 'syrup-caramel',    cat: 'syrups', name: 'Maribell · Карамель',    subtitle: 'класичний · з цукром',  unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-vanilla',    cat: 'syrups', name: 'Maribell · Ваніль',      subtitle: 'класичний · з цукром',  unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-hazelnut',   cat: 'syrups', name: 'Maribell · Лісовий горіх', subtitle: 'класичний · з цукром', unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-chocolate',  cat: 'syrups', name: 'Maribell · Шоколад',     subtitle: 'класичний · з цукром',  unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-raspberry',  cat: 'syrups', name: 'Maribell · Малина',      subtitle: 'класичний · з цукром',  unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-strawberry', cat: 'syrups', name: 'Maribell · Полуниця',    subtitle: 'класичний · з цукром',  unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-caramel-sf', cat: 'syrups', name: 'Maribell · Карамель SF', subtitle: 'Sugar Free · стевія',    unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },
  { id: 'syrup-vanilla-sf', cat: 'syrups', name: 'Maribell · Ваніль SF',   subtitle: 'Sugar Free · стевія',    unit: '0.7 л · пляшка', photo: 'assets/product-04.jpg' },

  // ================= CONCENTRATES — Ristora =================
  { id: 'conc-cioccolato', cat: 'concentrates', name: 'Ristora · Cioccolato',    subtitle: 'гарячий шоколад',    unit: '1 кг · уп', photo: 'assets/product-05.jpg' },
  { id: 'conc-cappuccino', cat: 'concentrates', name: 'Ristora · Cappuccino',    subtitle: 'розчинний капучино', unit: '1 кг · уп', photo: 'assets/product-05.jpg' },
  { id: 'conc-tea-limone', cat: 'concentrates', name: 'Ristora · Tè al Limone',  subtitle: 'чай з лимоном',      unit: '1 кг · уп', photo: 'assets/product-05.jpg' },

  // ================= EXTRAS =================
  { id: 'extra-stirrer-wood', cat: 'extras', name: 'Дерев\'яні мішалки 140 мм', subtitle: 'березові · ECO',      unit: '1000 шт · кор', photo: 'assets/product-03.jpg' },
  { id: 'extra-sugar-stick',  cat: 'extras', name: 'Цукор порційний "Стік"',    subtitle: '5 г · білий',          unit: '200 шт · кор', photo: 'assets/product-03.jpg' },
  { id: 'extra-milk-dry',     cat: 'extras', name: 'Сухе молоко для латте',     subtitle: 'спеціальне HoReCa',    unit: '1 кг · уп',    photo: 'assets/product-03.jpg' },
  { id: 'extra-napkins',      cat: 'extras', name: 'Серветки паперові',          subtitle: 'барні · білі',         unit: '500 шт · уп',  photo: 'assets/product-03.jpg' },
];
