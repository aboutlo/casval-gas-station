# README

## Prerequisites
- Install `cloud_sql_proxy` https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install
- Intstall https://ngrok.com/download

## Dev mode

    docker-compose up
    yarn build
    yarn start

### webhook & ngrok
In order to test in local the webhooks with the mobile app it's useful to expose the local instance via (ngrok)[https://ngrok.com/download]

    ngrok http 8080

Then in the `config.ts`  file update `rampNetwork.kovan.webhookURL`  with the ngrok url e.g. `http://bae108bc8677.ngrok.io/ramp-network`

This will bind the port 8080 to a public port via a proxy. 


## Crate a proxy from local to a Google Cloud SQL

Staging

    ./cloud_sql_proxy -instances=casval-308710:europe-west1:db-staging=tcp:5434

Production

    ./cloud_sql_proxy -instances=casval-308710:europe-west1:db-prod=tcp:5435

## Add a property to a model

- Open `schema.prisma`
- Add the property in a model e.g `fooId` as `String` in the Order entity or event a whole new entity  
```
model Order { 
   fooId             String
}
```
- Run `yarn db:migrate` this will ask for a migration name and generate all the required files
- Run `yarn db:test:migrate` to apply the changes to the test database too

## deploy

- Create a connection to the `Staging` Postgresql `./cloud_sql_proxy -instances=casval-308710:europe-west1:db-staging=tcp:5434`
- Run `yarn db:staging:migrate`