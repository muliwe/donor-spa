# Donor SPA

## Dependencies

Node.js v8.*

MongoDb 3.*

## Installation

`npm install`

`mongod --dbpath path_to_any_local_dir` in separate console

`mongo` then `use donors` -> should not raise errors 

## Tests

`npm test` to run socket.io tests

#### For Windows:

`set NODE_ENV=test`

`mocha server/tests/socket/ --reporter spec`

## Run app

`PORT=3030 node .`

#### For Windows:

`set NODE_ENV=dev`

`set PORT=3030`

`node .`

#### Then: 

Open `http://localhost:3030/`

## Stage deploy

`http://ruscur.ru:3030/`

## App developers build

`npm run build` -> `./build/`

Just copy it to `./client/` folder

or

`npm run startreact` to run a debug version

`npm run testreact` to run react smoke test
