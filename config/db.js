//위 코드가 정상 작동하려면 **config/db.js**가 반드시 mysql2/promise를 사용하여 Pool 객체를 export 하고 있어야 합니다. 아래와 같이 작성되어 있는지 확인해 주세요.


const mysql = require('mysql2/promise'); // 반드시 promise 버전 사용
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // .env 파일 필수
    database: process.env.DB_NAME || 'market_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // pool 객체를 바로 내보내야 bin/www에서 db.getConnection() 가능