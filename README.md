Инструкция по развертыванию:

* Установить git
* Забрать исходный код:
```
    git clone https://github.com/SHTrassEr/TubeWarden.git
```
* Установить NodeJS 8.9.3+,  MySql
* Создать пустую базу данных в MySql, при этом нужно указать:
```
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci
```
* Скопировать файл `src/config.example.ts` в `src/config.ts`
* В файле `config.ts` указать параметры подключения к БД, а так же ключ гугла. Инструкция по получению ключа гугла: https://developers.google.com/youtube/v3/getting-started  
* Выполнить команды
```
    cd TubeWarden/
    npm install
    npm run build
    npm start
```
* Для запуска служб сбора статистики нужно выполнить команды:
```
    node bin/script/statisticsGrabberWorker.js
    node bin/script/trendsGrabberWorker.js
```
    
    