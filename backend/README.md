# Настройка Django-проекта 

## Структура папок и файлов 

```
my_cloud
|
├── backend                                    # Django-проект
│   ├── backend                                # Основной пакет проекта
│   │   ├── asgi.py
│   │   ├── __init__.py
│   │   ├── settings.py                        # Основные настройки проекта
│   │   ├── urls.py                            # Основные URL-пути проекта
│   │   └── wsgi.py
│   ├── config.toml                            # Файл с переменными окружения
│   ├── files                                  # Приложение для управления файловым хранилищем
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── __init__.py
│   │   ├── migrations                         # Миграции базы данных
│   │   ├── models.py                          # Модели данных файлов
│   │   ├── permissions.py                     # Пользовательские права доступа
│   |   ├── serializers.py                     # Сериализаторы для REST API
│   │   ├── tests                              # Тесты для приложения "files"
│   │   │   ├── conftest.py                    # Файл с фикстурами(многократно используемый код настройки для тестов)
│   │   │   ├── __init__.py
│   │   │   ├── test_files_permissions.py      # Тесты для files/permissions.py
│   │   │   ├── test_files_serializers.py      # Тесты для files/serializers.py
│   │   │   └── test_files_views.py            # Тесты для files/views.py
│   │   ├── urls.py                            # URL-пути приложения "files"
│   │   └── views.py                           # Обработчик запросов (REST API endpoints)
│   ├── manage.py                              # Скрипт управления проектом
│   ├── pytest.ini                             # Файл конфигурации фреймворка pytest для автотестирования
│   ├── requirements.txt                       # Файл, который содержит список зависимостей проекта (библиотек) и их версий
│   └── users                                  # Приложение для аутентификации и управления пользователями
│       ├── admin.py
│       ├── apps.py
│       ├── __init__.py
│       ├── migrations                         # Миграции базы данных
│       ├── models.py                          # Модели данных пользователей
│       ├── permissions.py                     # Пользовательские права доступа
│       ├── serializers.py                     # Сериализаторы для REST API
│       ├── tests                              # Тесты для приложения "users"
│       │   ├── conftest.py                    # Файл с фикстурами(многократно используемый код настройки для тестов)
│       │   ├── __init__.py
│       │   ├── test_files_permissions.py      # Тесты для users/permissions.py
│       │   ├── test_files_serializers.py      # Тесты для users/serializers.py
│       │   └── test_files_views.py            # Тесты для users/views.py
│       ├── urls.py                            # URL-пути приложения "users"
│       └── views.py                           # Обработчик запросов (REST API endpoints)
├── frontend
│   ├── ...
|
└── README.md
```

## Создание Базы данных 
 
1. Перейдите в папку **Django-проекта**, где находится  *manage.py* (**замените \*user\* на имя пользователя, под которым работаете на сервере**)
   ```
   cd /home/*user*/my_cloud/backend
   ```
2. Переключитесь на пользователя **postgres** и подключитесь к **psql**
   ```
   sudo su postgres
   psql
   ```
3. Измените пароль у пользователя **postgres** 
    ```
   postgres=# ALTER USER postgres WITH PASSWORD 'your_password';
   ```
4. Создайте Базу данных с именем **my_cloud** и выйдите из **psql**
   ```
   postgres=# CREATE DATABASE my_cloud;
   exit
   ```
5. Выйдите в папку Django-проекта
   ```
   exit
   ```

## Настройка Django-проекта 

1. Откройте файл **config.toml** и заполните как указано ниже:
   ```
   sudo nano config.toml
   ```
   *config.toml*
   ```
   [django]
   SECRET_KEY = ''                     <-- укажите свой ключ
   DEBUG =false
   # Перечисляем разрешенные хосты
   ALLOWED_HOSTS = [
        'ip_your_server',              <-- укажите ip своего сервера
        'localhost', 
        '127.0.0.1'
    ]
   SITE_URL = 'http:/ip_your_server'  <-- укажите ip своего сервера

   [database]
   ENGINE = "django.db.backends.postgresql"
   NAME = "my_cloud" 
   USER = "postgres"                  
   PASSWORD = "your_password"         <-- укажите пароль, который установили у пользователя postgres
   PORT = "5432"

   [cors]
   # Перечисляем разрешенные источники CORS
   ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://ip_your_server",       <-- укажите ip своего сервера
   ]
   ALLOW_CREDENTIALS = true
   # Перечисляем заголовки, которые разрешено передавать
   ALLOW_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
   ]
   # Перечисляем заголовки, которые разрешено выставлять в ответе
   EXPOSE_HEADERS = ['content-disposition']

   [rest_framework]
   DEFAULT_PAGINATION_CLASS = 'rest_framework.pagination.PageNumberPagination'
   PAGE_SIZE = 100

   [logging.loggers.users]
   LEVEL = 'INFO'

   [logging.loggers.files]
   LEVEL = 'INFO'
   
   ```

   Сохраните файл и выйдите из него

2. Создайте вертуальное окружение **в папке Django-проекта** и активируйте его 
   ```
   python3 -m venv env
   source evn/bin/activate
   ```
3. Установите список зависимостей проекта (библиотек) и их версий из **requirements.txt**
   ```
   pip install -r requirements.txt
   ```
4. Примените миграции к базе данных
   ```
   python3 manage.py migrate
   ```
5. Создайте учётную запись суперпользователя (*администратора*)
   ```
   python3 manage.py createsuperuser
   ```
6.  Соберите все статические файлы из проекта 
    ```
    python3 manage.py collectstatic
    ```

Вы подготовили Django-проект к развертыванию. Перейдите [***к настройкам React-проекта***](/frontend/README.md)