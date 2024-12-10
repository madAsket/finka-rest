const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
require('dotenv').config({path: `${process.cwd()}/${envFile}`});
module.exports = {
  "development": {
    "username": process.env.POSTGRESDB_USER,
    "password": process.env.POSTGRESDB_ROOT_PASSWORD,
    "database": process.env.POSTGRESDB_DATABASE,
    "host": process.env.POSTGRESDB_HOST,
    "port": process.env.POSTGRESDB_PORT,
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.POSTGRESDB_USER,
    "password": process.env.POSTGRESDB_ROOT_PASSWORD,
    "database": process.env.POSTGRESDB_DATABASE,
    "host": process.env.POSTGRESDB_HOST,
    "port": process.env.POSTGRESDB_PORT,
    "dialect": "postgres"
  }
}
