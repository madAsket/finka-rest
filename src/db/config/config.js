require('dotenv').config({path: `${process.cwd()}/.env`});
module.exports = {
  "development": {
    "username": process.env.POSTGRESDB_USER,
    "password": process.env.POSTGRESDB_ROOT_PASSWORD,
    "database": process.env.POSTGRESDB_DATABASE,
    "host": process.env.POSTGRESDB_HOST,
    "port": process.env.POSTGRESDB_LOCAL_PORT,
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
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
