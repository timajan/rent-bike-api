## Запуск

Спочатку встановіть залежності:

```bash
npm install
```

Далі створіть файл .env і вкажіть параметри підключення до MySQL:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=bike_rental_db
DB_USER=bike_user
DB_PASSWORD=bike_password123
PORT=3000
```

Після цього створіть базу даних і таблиці, виконавши SQL-скрипт sql/schema.sql.

Для запуску сервера виконайте команду:

```bash
npm start
```