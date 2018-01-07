Инструкция по развертыванию:

1. Установить git
1. Забрать исходный код:
    git clone https://github.com/SHTrassEr/TubeWarden.git
1. Установить NodeJS 8.9.3+,  MySql
1. Создать пустую базу данных в MySql
1. Скопировать файл `src/config.example.ts` в `src/config.ts`
1. В файле `config.ts` указать параметры подключения к БД, а так же ключ гугла. Инструкция по получению ключа гугла: https://developers.google.com/youtube/v3/getting-started  
1. Выполнить команды
    sudo npm install -g gulp
    cd TubeWarden/
    npm install
    gulp
    npm start
1. Для запуска служб сбора статистики нужно выполнить команды:
    node bin/script/statisticsGrabberWorker.js
    node bin/script/trendsGrabberWorker.js
    
    