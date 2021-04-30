# README
## Prerequisites
- Install `cloud_sql_proxy` https://cloud.google.com/sql/docs/mysql/connect-admin-proxy#install

## Crate a proxy from local to staging/prod

    ./cloud_sql_proxy -instances=casval-308710:europe-west1:db-staging=tcp:5432


