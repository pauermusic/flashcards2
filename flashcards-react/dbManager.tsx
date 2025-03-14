// Import the sqlite3 module to interact with the SQLite database
import sqlite3 from 'sqlite3';

class DBManager {
  // This is a static instance to follow the Singleton design pattern.
  // Only one instance of the DBManager class will exist throughout the application.
  private static instance: DBManager;
  
  // This will hold the reference to the database connection once it's opened
  private db: sqlite3.Database | null = null;

  // Private constructor to prevent creating new instances from outside the class
  private constructor() {}

  // This method ensures only one instance of the DBManager is created
  // It will also automatically connect to the database when the instance is created
  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();  // Create the instance if it doesn't exist
      DBManager.instance.connect();  // Connect to the database
    }
    return DBManager.instance;  // Return the existing instance (or newly created one)
  }

  // This method opens the SQLite database
  private connect() {
    // Open the database with the provided filename (cards.db).
    // If the database file doesn't exist, it will be created automatically.
    this.db = new sqlite3.Database('./cards.db', (err) => {
      if (err) {
        // If there's an error opening the database, log the error message
        console.error('Error opening database:', err.message);
      } else {
        // If the connection is successful, log a success message
        console.log('Database connected successfully');
      }
    });
  }

  // This method returns the current database connection
  // It throws an error if the connection doesn't exist yet
  public getDB() {
    if (!this.db) {
      throw new Error('Database is not connected');  // Ensure that the database is connected before proceeding
    }
    return this.db;  // Return the connected database instance
  }

  // This method closes the database connection
  public close() {
    if (this.db) {
      // Attempt to close the database and log the result
      this.db.close((err) => {
        if (err) {
          // If there's an error closing the database, log the error message
          console.error('Error closing database:', err.message);
        } else {
          // If the database is successfully closed, log a success message
          console.log('Database closed');
        }
      });
    }
  }
}

// Export the DBManager class so it can be used elsewhere in your app
export default DBManager;
