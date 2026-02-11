import app from "./app.js";
// import mysql from "mysql";
// import { connectToServer } from "./public/js/db.js";

const port = 3000;

// const pool = mysql.createPool({
//   host: process.env.DB_MYSQL_HOST,
//   user: process.env.DB_MYSQL_USER,
//   password: process.env.DB_MYSQL_PASS,
//   database: process.env.DB_MYSQL_DATABASE,
//   connectionLimit: 10,
// });

// connectToServer()
//   .then(() => {
//     console.log("Mongodb connect successfully");
//   })
//   .catch((err) => {
//     console.error(
//       "Failed to start server due to database connection error:",
//       err,
//     );
//     process.exit(1);
//   });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
