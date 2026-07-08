import mysql from "mysql2";

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"nethmal2010",
    database:"chat-app"
});


db.connect((err) => {
    if(!err){
        console.log("Connected to the database");
    }else{
        console.error("Error connecting to the database:", err);
    }
});


export default db;