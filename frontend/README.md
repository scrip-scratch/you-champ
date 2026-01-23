# WeOS Frontend

Frontend для Telegram мини-приложения системы управления танцевальными школами.

## Технологии

- React
- TypeScript
- Vite
- Material-UI
- Telegram WebApp API

## Установка

```bash
npm install
```

## Настройка

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

## Запуск

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Превью
npm run preview
```

## Структура

- `src/pages/` - Страницы приложения
- `src/components/` - Переиспользуемые компоненты
- `src/contexts/` - React контексты
- `src/types/` - TypeScript типы

## Роли

- **Student** - Ученик
- **Trainer** - Тренер
- **Admin** - Администратор школы

