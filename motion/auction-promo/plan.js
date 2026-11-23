window.PLAN = {
  "title": "Аукцион квартиры · Циан",
  "duration": 15,
  "fps": 30,
  "canvas": [1920, 1080],
  "language": "ru",
  "product": "Циан · учебный прототип аукциона",
  "audience": "Покупатели квартир",
  "purpose": "Промо: условия → ставка → подтверждение",
  "hold": 1.5,
  "formats": ["16:9"],
  "max_bytes": 20000000,
  "audio": false,
  "vo": [],
  "titles": [],
  "pronounce": {},
  "emphasis": [],
  "music": null,
  "scenes": [
    {"from": 0, "to": 3, "source": "/auction?role=buyer", "show": "Фото квартиры, метка Аукцион", "copy": "Квартира на аукционе"},
    {"from": 3, "to": 6, "source": "/auction?role=buyer", "show": "Текущая ставка 18 800 000 ₽, шаг 100 000 ₽"},
    {"from": 6, "to": 11, "source": "/auction?role=buyer", "show": "Ставка 18 900 000 ₽, клик, отправка"},
    {"from": 11, "to": 15, "source": "/auction?role=buyer&state=accepted", "show": "Ваша ставка принята", "copy": "Аукцион квартиры · Циан"}
  ]
};
