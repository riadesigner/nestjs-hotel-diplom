# NESTJS HOTEL SERVICE

Небольшой дипломный проект (backend) – сервис бронирования для сети гостиниц

### Модудули

- Гостиницы/номера (Добавление, удаление, редактирование, файлы)
- Резервирование номера
- Аутентификация/Авторизация
- Запросы в поддержку
- Чат с менеджером

### Первый запуск

При запуске сервис проверяет есть ли в БД хоть один пользователь с ролью админа,   
если нет, то добавляет первого админа с почтой super_admin@mail.ru и паролем super_pass   

### гостиницы

- GET /api/admin/hotels / admin / 2.1.4. Получение списка гостиниц 
- POST /api/admin/hotels / admin / 2.1.3. Добавление гостиницы 
- PUT /api/admin/hotels/:id / admin / 2.1.5. Изменение описания гостиницы 

### номера

- GET /api/common/hotel-rooms/:id / all / 2.1.2. Информация о конкретном номере 
- GET /api/common/hotel-rooms / all / 2.1.1. Поиск номеров
- POST /api/admin/hotel-rooms/ admin / 2.1.6. Добавление номера
- PUT /api/admin/hotel-rooms/:id / admin / 2.1.7. Изменение описания номера

### резервирование (бронь)

- POST /api/client/reservations / client / 2.2.1. Бронирование номера клиентом
- GET /api/client/reservations / client / 2.2.2. Список броней текущего пользователя
- DELETE /api/client/reservations/:id / client / 2.2.3. Отмена бронирования клиентом
- GET /api/manager/reservations/:userId / manager / 2.2.4. Список броней конкретного пользователя
- DELETE /api/manager/reservations/:id / manager / 2.2.5. Отмена бронирования менеджером

### пользователи

- POST /api/client/register / all / 2.3.3. Регистрация
- GET /api/manager/users / manager / 2.4.2. Получение списка пользователей
- GET /api/admin/users / admin / 2.4.2. Получение списка пользователей
- POST /api/admin/users / admin / 2.4.1. Создание пользователя

### аутентификация

- POST /api/auth/login (войти)
- POST /api/auth/logout (выйти)

### чаты (поддержка)

- GET /api/manager/support-requests / manager / 2.5.3. Получение списка обращений в поддержку для менеджера / ready
- GET /api/client/support-requests / client / 2.5.2. Получение списка обращений в поддержку для клиента / ready
- POST /api/client/support-requests / client / 2.5.1. Создание обращения в поддержку / ready
- GET /api/common/support-requests/:id/messages / client | manager / 2.5.4. Получение истории сообщений из обращения в техподдержку / ready
- POST /api/common/support-requests/:id/messages / client | manager / 2.5.5. Отправка сообщения / ready
- POST /api/common/support-requests/:id/messages/read / client | manager / 2.5.6. Отправка события, что сообщения прочитаны / ready


### аутенитификация / авторизация

Созданы роли – Администратор, Менеджер, Клиент

## ---------------------- ДОПОЛНИТЕЛЬНО -------------------------------

- Создан guards для webSocket (на основе адаптера WsAdapter.ts)
- Добавлена подписка на сообщения в чате (клиент: http://localhost:8080/chat)
