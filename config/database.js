import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'admin',
  database: 'products_db'
};

// Function to create a MySQL connection
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('MySQL Connected successfully');
    return connection;
  } catch (error) {
    console.error('Error in MySQL connection', error);
    throw error;
  }
};

export { createConnection };