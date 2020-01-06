import util from 'util';
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
}

export default function openDBConnection() {
  const connection = mysql.createConnection(sqlConfig);
  return {
    query( sql, args ) {
      return util.promisify( connection.query )
        .call( connection, sql, args );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}