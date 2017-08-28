# Donor SPA

## Dependencies

Node.js v8.*

MongoDb 3.*

## Installation

`npm install`

`mongod --dbpath path_to_any_local_dir` in separate console

`mongo` then `use donors` -> shold not raise errors 

## Tests

`npm test` to install socket.io tests

## Run app

`PORT=3030 node .`

Open `http://localhost:3030/`

## Stage deploy

`http://ruscur.ru:3030/`

## App developers build

`npm run build` -> `./build/`

Just copy it to `./client/` folder

or

`npm run startreact` to run a debug version

`npm run testreact` to run react smoke test
