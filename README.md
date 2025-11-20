# Облачное хранилище My Cloud

**`My Cloud`** - это удобное и надежное облачное хранилище, разработанное, чтобы упростить управление вашими файлами. Оно позволяет пользователям отображать, загружать, скачивать, отправлять и переименовывать файлы.

## Развертывание и запуск My Cloud 

### Содержание

* [Общие инструкции по развертыванию](#общие-инструкции-по-развертыванию)

* [Настройка и подготовка backend и frontend к развертыванию](#настройка-и-подготовка-backend-и-frontend-к-развертыванию)

* [Настройка Gunicorn](#настройка-gunicorn)

* [Настройка Nginx](#настройка-nginx)

* [Запуск сервера](#запуск-сервера)

* [Дополнительно](https://github.com/AleksandraIvanova90)



### Общие инструкции по развертыванию 

1. Для получения доступа к удаленному серверу нам нужен ***SSH ключ***. Если его нет сгенерируйте его 
```
ssh-keygen
```

2. Создайте **Облачный сервер** на ***Ubuntu*** на платформе ***Reg.ru***. 
Если возникнут проблемы с настройкойб воспользуйтесь инструкцией ["Управление услугой "Облачные серверы"](https://reg.cloud/support/cloud/oblachnyye-servery/zakaz-i-upravleniye-uslugoy-oblachnyye-servery/upravleniye-uslugoy-oblachnyye-servery?utm_source=reg.ru&utm_medium=organic&utm_campaign=reg.cloud&utm_referrer=reg.ru&utm_content=%2Fsupport%2Fcloud%2Foblachnyye-servery%2Fzakaz-i-upravleniye-uslugoy-oblachnyye-servery%2Fupravleniye-uslugoy-oblachnyye-servery). 
   
3. Подключитесь к серверу 
```
ssh root@ip_your_server
```
4. Создайте нового пользователя, например ***user***. Назначьте его ***Администратором*** и переключитесь на него 
```
adduser user
usermod user -aG sudo
su user
```
5. Перейдите в домашнюю директорию
```
cd ~
```
6. Обновите пакетный менеджер 
```
sudo apt update
```
7. Установите библиотеки
```
sudo apt install python3-venv python3-pip postgresql nginx nodejs npm
```
8. Проверьте версию **git**
```
git --version
```
9. Скачайте проект с **GitHub** 
```
git clone https://github.com/AleksandraIvanova90/my_cloud.git
```
10. Перейдите в папку проекта
```
cd my_cloud
```
Структура нашего проекта: 
```
my_cloud
|
├── backend     # Django-проект
│   ├── ...
|
├── frontend    # React-проект
│   ├── ...
│
└── README.md
```

### Настройка и подготовка backend и frontend к развертыванию 

1. [***Настройка Django-проекта***](/backend/README.md) 

2. [***Настройка React-проекта***](/frontend/README.md) 

### Настройка Gunicorn

Cоздайте файл с настройками Gunicorn (**замените \*user\* на имя пользователя, под которым работаете на сервере**)
```
cd /home/*user*/my_cloud
sudo nano /etc/systemd/system/gunicorn.service
```
*gunicorn.service* (**замените \*user\* на имя пользователя, под которым работаете на сервере**)
```
[Unit]
Description=gunicorn service
After=network.target

[Service]
User=user            <-- укажите имя пользователя, под которым работаете на сервере
Group=www-data
WorkingDirectory=/home/*user*/my_cloud/backend
ExecStart=/home/*user*/my_cloud/backend/env/bin/gunicorn --access-logfile - --log-level debug --worker 3 --bind unix:/home/*user*/my_cloud/backend/backend/project.sock backend.wsgi:application


[Install]
WantedBy=multi-user.target
```
Сохраните файл и выйдите из него

### Настройка Nginx
1. Cоздайте файл с настройками Nginx
```
sudo nano /etc/nginx/sites-available/my_project
```
*my_project* (**замените \*user\* на имя пользователя, под которым работаете на сервере**)
```
server {
    listen 80;
    server_name ip_your_server;   <-- укажите ip своего сервера

    # Обслуживание статики Django backend
    location /static/ {
        alias /home/*user*/my_cloud/backend/static/;
    }

    # API endpoints для Django (все запросы к /api/)
    location /api/ {

        proxy_pass http://unix:/home/*user*/my_cloud/backend/backend/project.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

  }

    # Обслуживание React frontend (все остальные запросы)
    location / {
        root /home/*user*/my_cloud/frontend/dist;  # Путь к собранному React
        index index.html index.htm;
        try_files $uri $uri/ /index.html;  # SPA fallback для React Router

        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Безопасность
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";

        # Решение проблемы Cross-Origin-Opener-Policy
        add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
        add_header Cross-Origin-Embedder-Policy "credentialless" always;
    }

    # Логирование
    access_log /var/log/nginx/my_project_access.log;
    error_log /var/log/nginx/my_project_error.log;
}
```
Сохраните файл и выйдите из него

2. Проверьте синтаксис конфигурационного файла
```
sudo nginx -t
```
3. Создайте ссылку между файлами 
```
sudo ln -s /etc/nginx/sites-available/my_project etc/nginx/sites-enabled
```
4. Настройте доступ к портам
```
sudo ufw allow "Nginx Full'
```
### Запуск сервера 

1. Запустите Nginx
```
sudo systemctl start nginx
```
2. Запустите Gunicorn
```
sudo systemctl start gunicorn
```

***Проверка: В браузере укажите IP-адрес сервера, сайт должен работать***

### Дополнительно

Автором проекта является: [Иванова Александра](https://github.com/AleksandraIvanova90)

    


