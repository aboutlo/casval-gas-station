# README

## Prerequisites
- Install `cloud_sql_proxy` https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install

## Crate a proxy from local to a Google Cloud SQL

Staging

    ./cloud_sql_proxy -instances=casval-308710:europe-west1:db-staging=tcp:5432

Production

    ./cloud_sql_proxy -instances=casval-308710:us-central1:db-production=tcp:5435

