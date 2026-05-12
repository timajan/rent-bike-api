# Rent Bike API — Лабораторна робота №6

Підсумковий backend-проєкт на **Node.js + Express + MySQL** з REST API, CRUD-операціями, JWT-авторизацією та документацією **Swagger/OpenAPI**.

## Що реалізовано

- REST API на Express.
- Підключення до MySQL через Sequelize ORM.
- CRUD для велосипедів `/bikes`.
- CRUD для станцій прокату `/stations`.
- Створення, перегляд, оновлення статусу та видалення бронювань `/bookings`.
- Реєстрація, логін, refresh/logout, профіль користувача `/auth`.
- JWT Bearer authorization.
- Swagger UI для тестування API.
- Завантаження файлів через `multer`.
- Docker Compose для запуску API, MySQL та Redis.
- `render.yaml` для прикладу деплою на Render.

## Структура проєкту

```text
rentBikeApi/
├── app.js
├── server.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── .env.example
├── config/
├── middleware/
├── models/
├── routes/
├── scripts/
│   └── seed.js
├── sql/
│   └── schema.sql
├── tests/
└── utils/
```

## Швидкий запуск через Docker

1. Створити `.env` на основі прикладу:

```bash
copy .env.example .env
```

Для Windows PowerShell можна використати:

```powershell
Copy-Item .env.example .env
```

2. У `.env` для повного Docker Compose залишити такі параметри:

```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=bike_rental_db
DB_USER=root
DB_PASSWORD=root
CACHE_DRIVER=redis
REDIS_URL=redis://redis:6379
```

3. Запустити проєкт:

```bash
docker compose up --build
```

4. Відкрити Swagger UI:

```text
http://localhost:3000/api-docs
```

## Запуск без Docker для Node.js

Можна запустити тільки MySQL та Redis у Docker, а Node.js — локально:

```bash
docker compose up -d mysql redis
npm install
copy .env.example .env
```

У `.env` для локального Node.js вкажіть:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=bike_rental_db
DB_USER=root
DB_PASSWORD=root
CACHE_DRIVER=memory
```

Потім виконайте:

```bash
npm run db:seed
npm start
```

## Тестові користувачі після seed

Після команди `npm run db:seed` будуть створені:

```text
Admin:  admin@example.com / admin123
Client: client@example.com / client123
```

Для admin-only endpoint-ів потрібно виконати `/auth/login`, скопіювати `accessToken`, у Swagger натиснути **Authorize** і вставити:

```text
Bearer <accessToken>
```

## Основні endpoint-и

| Method | Endpoint | Опис |
|---|---|---|
| GET | `/` | інформація про API |
| GET | `/health` | health check для деплою |
| GET | `/status` | runtime-метрики сервера |
| POST | `/auth/register` | реєстрація |
| POST | `/auth/login` | логін |
| GET | `/auth/profile` | профіль користувача |
| PUT | `/auth/profile` | оновлення профілю |
| GET | `/bikes` | список велосипедів |
| GET | `/bikes/:id` | один велосипед |
| POST | `/bikes` | створити велосипед, admin |
| PUT | `/bikes/:id` | оновити велосипед, admin |
| DELETE | `/bikes/:id` | видалити велосипед, admin |
| GET | `/stations` | список станцій |
| GET | `/stations/:id` | одна станція |
| POST | `/stations` | створити станцію, admin |
| PUT | `/stations/:id` | оновити станцію, admin |
| DELETE | `/stations/:id` | видалити станцію, admin |
| GET | `/bookings` | список бронювань |
| GET | `/bookings/:id` | одне бронювання |
| POST | `/bookings` | створити бронювання |
| PUT | `/bookings/:id/status` | змінити статус |
| DELETE | `/bookings/:id` | видалити бронювання |
| POST | `/upload` | завантаження одного файлу |
| POST | `/upload-multiple` | завантаження кількох файлів |
| GET | `/api-docs` | Swagger UI |
| GET | `/api-docs/json` | OpenAPI JSON |

## Приклади cURL

### Health check

```bash
curl http://localhost:3000/health
```

### Login admin

```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

### Створити станцію

```bash
curl -X POST http://localhost:3000/stations ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"name\":\"Campus Station\",\"address\":\"KPI, Kyiv\",\"latitude\":50.449,\"longitude\":30.457}"
```

### Створити велосипед

```bash
curl -X POST http://localhost:3000/bikes ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -d "{\"title\":\"Road Bike\",\"type\":\"road\",\"price_per_hour\":100,\"status\":\"available\",\"station_id\":1,\"description\":\"Fast road bike\"}"
```

### Отримати велосипеди

```bash
curl http://localhost:3000/bikes
```

## Деплой на Render

1. Завантажити проєкт на GitHub.
2. На Render створити Web Service з цього репозиторію.
3. Build command:

```bash
npm ci
```

4. Start command:

```bash
npm start
```

5. Додати змінні середовища: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
6. Health check path:

```text
/health
```

## Відповідність ЛР №6

- Завдання 1: REST API на Node.js + Express — виконано.
- Завдання 2: MySQL + CRUD — виконано.
- Завдання 3: Swagger UI — виконано.
- Завдання 4: Endpoint-и задокументовані — виконано.
- Завдання 5: API можна тестувати через Swagger UI — виконано.
- Завдання 6: Підсумковий REST API з MySQL та Swagger — виконано.
