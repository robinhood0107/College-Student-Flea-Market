const mysql = require('mysql2/promise'); // 반드시 promise 버전 사용하기!!! (async/await 지원)
const dotenv = require('dotenv');

// .env 파일에서 환경 변수 로드
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',        
    user: process.env.DB_USER || 'root',             
    password: process.env.DB_PASSWORD,             //.env파일에 있는 비번 사용
    database: process.env.DB_NAME || 'market_db',   
    charset: 'utf8mb4',                              
    waitForConnections: true,                       
    connectionLimit: 10,                             
    queueLimit: 0                                    
});

// 다른 파일에서 require('./config/db')로 사용
module.exports = pool;