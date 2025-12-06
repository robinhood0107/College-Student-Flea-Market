const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const dotenv = require('dotenv');





// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
 
//여기부터 미들웨어 만드는 것

// 로깅 미들웨어 dev에만 적용 
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 요청 본문 파싱 미들웨어
app.use(express.json()); // JSON 형식의 요청 본문 파싱 (AJAX 요청용)
app.use(express.urlencoded({ extended: true }));
// HTML 폼 데이터 파싱: <form method="POST">로 전송된 데이터를 req.body 객체로 변환하는 것
// 예시: title=맥북&price=1200000 → req.body = { title: '맥북', price: '1200000' }
// extended 프로터티의 경우 설명 ==> true는 중첩 객체 지원 (user[name]=홍길동 → { user: { name: '홍길동' } })

//템플릿 엔진으로 EJS를 사용한다
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





//세션 설정
const db = require('./config/db');

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'market_db',
  clearExpired: true,
  checkExpirationInterval: 600000, // 10분마다 만료된 세션 정리
  expiration: 7200000, // 2시간 (일반적인 웹사이트 세션 유지 시간)
}, db);

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  name: 'sessionId', // 기본 'connect.sid' 대신 커스텀 이름 사용
  cookie: {
    maxAge: 7200000, // 2시간 (세션 만료 시간과 동일하게 설정)
    httpOnly: true, // XSS 공격 방지 (JavaScript로 쿠키 접근 불가)
    secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
    sameSite: 'strict' // CSRF 공격 방지 (strict: 같은 사이트에서만 전송)
  }
}));



//Passport 인증 설정
app.use(passport.initialize()); // Passport 초기화 (요청 객체에 passport 속성 추가)
app.use(passport.session()); // Passport 세션 지원 (로그인 상태 유지)


// ppt에 있는 설명 다시 복습

// Passport 전략 설정: config/passport.js에서 LocalStrategy(이메일/비밀번호 로그인)를 passport.use()로 등록
// 
// 동작 방식:
// 1) new LocalStrategy(options, verifyCallback)로 전략 객체 생성
//    - options: 전략 설정 (usernameField: 'email' 등)
//    - verifyCallback: 인증 검증 함수 (email, password, done) => { ... }
// 2) passport.use('local', strategy)로 전략 등록
// 3) 라우터에서 passport.authenticate('local') 호출 시 등록된 전략의 verifyCallback 실행
// 4) verifyCallback 내부에서 DB 조회 후 인증 결과를 done(null, user) 또는 done(null, false)로 전달
// 5) done(null, user) 시 req.login()이 자동 호출되어 세션에 사용자 정보 저장
require('./config/passport')(passport);


app.use((req, res, next) => {
  // 모든 뷰에서 user 변수 사용 가능하도록 설정
  // req.user는 passport.deserializeUser에서 설정됨
  res.locals.user = req.user || null;
  
  //이거 전역변수 처럼 사용된다
  res.locals.currentPath = req.path;
  next();
});

//여기가 라우터 연결 부분

// 인증 미들웨어 (로그인 체크)
const isAuthenticated = require('./middlewares/isAuthenticated');

// 인증 라우터 (로그인/회원가입은 인증 불필요)
app.use('/auth', require('./routes/authRoutes'));

// 인증이 필요한 모든 라우트에 미들웨어 적용
// 로그인하지 않은 사용자는 자동으로 /auth/login으로 리다이렉트됨
app.use(isAuthenticated);

// 메인 라우터 (홈 페이지)
app.use('/', require('./routes/index'));

// 상품 라우터
app.use('/product', require('./routes/productRoutes'));

// 사용자 라우터
app.use('/user', require('./routes/userRoutes'));

// 관리자 라우터
app.use('/admin', require('./routes/adminRoutes'));

// API 라우터 (AJAX 요청용) 여기 아래에 쭉 구현
// 이거 나중에 구현하면 됨
// 예: app.use('/api/product', require('./routes/api/productRoutes'));



// 404 에러
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 - 페이지를 찾을 수 없습니다',
    message: '요청하신 페이지를 찾을 수 없습니다.',
    error: { status: 404 }
  });
});

// 404 핸들러 (모든 라우트 뒤에 위치)
app.use((req, res) => {
  res.status(404).send('404');
});

// 일반 에러 핸들러
app.use((err, req, res, next) => {
  // 에러 로깅
  console.error('Error:', err);
  
  // 모든 에러는 404로 표시
  res.status(404).send('404');
});

module.exports = app;


// 직접 실행 시에만 서버 시작 (require('./app')로 로드될 때는 실행 안 됨)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`서버: http://localhost:${port}`);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // 비정상 종료시킴
  });
  
  // unhandledRejection: 동기 예외 (try/catch 미사용)
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // 비정상 종료시킴
  });
}

