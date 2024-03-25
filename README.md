# NESTJS HOTEL SERVICE

При запуске проверяет есть ли в БД хоть один пользователь с ролью админа,   
если нет, то добавляет первого админа с почтой super_admin@mail.ru и паролем super_pass   
   

## ------------ CONTROLLERS SORTED BY MODULES (SITE SECTIONS) ------------ 

### гостиницы

- GET /api/admin/hotels / admin / 2.1.4. Получение списка гостиниц / ready
- POST /api/admin/hotels / admin / 2.1.3. Добавление гостиницы / ready
- PUT /api/admin/hotels/:id / admin / 2.1.5. Изменение описания гостиницы / ready

### номера

- GET /api/common/hotel-rooms/:id / all / 2.1.2. Информация о конкретном номере / reay
- GET /api/common/hotel-rooms / all / 2.1.1. Поиск номеров / reay
- POST /api/admin/hotel-rooms/ admin / 2.1.6. Добавление номера / reay
- PUT /api/admin/hotel-rooms/:id / admin / 2.1.7. Изменение описания номера / ready

### резервирование (бронь)

- POST /api/client/reservations / client / 2.2.1. Бронирование номера клиентом / ready
- GET /api/client/reservations / client / 2.2.2. Список броней текущего пользователя / ready
- DELETE /api/client/reservations/:id / client / 2.2.3. Отмена бронирования клиентом / ready
- GET /api/manager/reservations/:userId / manager / 2.2.4. Список броней конкретного пользователя / ready
- DELETE /api/manager/reservations/:id / manager / 2.2.5. Отмена бронирования менеджером / ready

### пользователи

- POST /api/client/register / all / 2.3.3. Регистрация / ready
- GET /api/manager/users / manager / 2.4.2. Получение списка пользователей / ready
- GET /api/admin/users / admin / 2.4.2. Получение списка пользователей / ready
- POST /api/admin/users / admin / 2.4.1. Создание пользователя / ready

### аутентификация

- POST /api/auth/login (войти) / ready
- POST /api/auth/logout (выйти) / ready

### чаты (поддержка)

- GET /api/manager/support-requests / manager / 2.5.3. Получение списка обращений в поддержку для менеджера / ready
- GET /api/client/support-requests / client / 2.5.2. Получение списка обращений в поддержку для клиента / ready
- POST /api/client/support-requests / client / 2.5.1. Создание обращения в поддержку / ready
- GET /api/common/support-requests/:id/messages / client | manager / 2.5.4. Получение истории сообщений из обращения в техподдержку / ready
- POST /api/common/support-requests/:id/messages / client | manager / 2.5.5. Отправка сообщения / ready
- POST /api/common/support-requests/:id/messages/read / client | manager / 2.5.6. Отправка события, что сообщения прочитаны / ready



## ------------------------ ТЕХНИЧЕСКАЯ РЕАЛИЗАЦИЯ ------------------------ 

### аутенитификация / авторизация

[local.strategy.ts](./src/auth/local.strategy.ts), настраивает пару email/password   
[local.guard.ts](./src/auth/local.guard.ts), вход по email/паролю и сохранение в сессию 
[logged-in.guard.ts](./src/auth/logged-in.guard.ts), допускает к ресурсу, если пользователь авторизован   
[admin.guard.ts](./src/auth/admin.guard.ts), допускает к ресурсу только Админов
[manager.guard.ts](./src/auth/manager.guard.ts), допускает к ресурсу только Менеджеров
[client.guard.ts](./src/auth/client.guard.ts), допускает к ресурсу только Клиентов

## ---------------------- ДОПОЛНИТЕЛЬНО -------------------------------

- Создан guards для webSocket (на основе адаптера WsAdapter.ts)
- Добавлена подписка на сообщения в чате (клиент: http://localhost:8080/chat)
