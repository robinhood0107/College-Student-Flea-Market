const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// EJS 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 더미 데이터
const dummyUser = {
  id: 1,
  name: '김대학생',
  email: 'student@university.ac.kr',
  profile_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTclSH8WeZ-aauUNobjNYCX2BWYj6W3wwrEC0-I77Jo2vLrTnT3Hp8bI3ZtSS8xpptzOBj2t1k_lJ5vJZVx-dTTdLRjU2xbDEEItfj-zbZ5qYAsQ59q4nExbUFDKnlf3jzo4q6r8VDPdkX_w6y8NeZ1xKIbeuQs3kNFaaGGq9NLY_hVPb1Rf9b0Y1Edv815wAHTF3GTFVWQA668970dHok6VpCcJH5INx8aTmv54GEaXgYgsD0cHCx-jvA7qCTI5PxHLWpwCEUZ4'
};

const dummyProducts = [
  {
    id: 1,
    title: 'Advanced Economics Textbook',
    price: 25000,
    main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANdwTRchqZseOUrZn8Fgoaf_t8ZJoFl_-dSiAM-ee1SnEtWxbflWtEQ7H7adIn0G5_KyHqAWAfrnbtzgJ_lwemkEp0mFIasw7bLJTt-Xud-quR1JVyRyU6HqjPpADeFUSwZZtObyFAAqmJpFV3lX0OaVMD5Lhg-K0bkdPjQIV7jTjMhbf6DlYjdTwSs7R32aRDgp-IZ3Z1MV-SOt4j9xLlMWoyIMEFMpOhnzCBRTjGY7lAdvVMkHT3InWaC-oQRdt7bPwL4VQJCnQ',
    location: 'Sinchon-dong',
    like_count: 12,
    is_verified: true,
    condition: 'Good',
    status: '판매중'
  },
  {
    id: 2,
    title: 'Used IKEA Desk Lamp',
    price: 15000,
    main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkVZH1EyoyswzKOIg2ke_uiZA94VWaxK0lml0muKcmXivVr1ZcfuiEBFcQJ3nPEipFKqNphB7lKa4hsFWgDMwwlbLcZJfiwoylx4iu9e0p8o2KwTwrFpXZ8vqELrQX2qcZl233dgNGRe8FAsXd9NA5KtirFXVlE1gpnUEO_IElm5Q5TXxTngFyMZuAV3u4ME-StXadCgImXT1BU50K9PHLaWHenkPEnIx62ovi6mDPtxNFYLDoQ5t9RB0tw4Do34Xq85wGd8zH3bE',
    location: 'Hapjeong-dong',
    like_count: 5,
    is_verified: false,
    condition: 'Like New',
    status: '판매중'
  }
];

const dummyProduct = {
  id: 1,
  title: 'MacBook Pro 14인치 M1 (상태 좋음)',
  price: 1200000,
  category: '노트북',
  description: '2021년에 구매한 맥북 프로 14인치 M1 기본형 모델입니다. 주로 문서 작업과 웹서핑 용도로 사용하여 상태가 매우 깨끗합니다.\n\n외관에 눈에 띄는 스크래치나 찍힘 전혀 없으며, 키보드나 트랙패드도 번들거림 없이 쾌적합니다. 배터리 성능도 95%로 아주 좋습니다.\n\n풀박스 구성으로, 충전기 및 케이블 모두 포함입니다. 직거래는 서울대학교 근처에서 가능합니다.',
  main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf08NKZu9wIve3FLJz1jRlwTsoJKkaLN-K1vy6YeX32TTzNFqavUi7TsLnl9j1jP5Oth_a57KSaWz3VKomasPmmRjDaiE3v0onv62oBs7hbKpU2L6E1uS_gNd5G1Eh9sivKWImv5aY8fDlMCG-tlIBZMbvvY3Y5_huXNH0JohJ0ibFpyEz5jvRNsUPfjJpG_YxCrRjsba6rBKLR2qrB5jM-6Fnc4hote9wBDEAu4HNfI22Qh2G16giYGzBgMRsBU1GdpOiEWCKf7M',
  images: ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg'],
  status: 'For Sale',
  created_at: '5분 전',
  seller: {
    id: 1,
    name: 'Alex Doe',
    profile_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyfEu0GUF2egpnVbg0vW2bQtoUI0NxIdVV_fPuMT2DXeLin_xVOws70BYF1wKI_GDHh9jNddkHpBo4VRAVd55IlHNLFhN-3TQNwZ0AyjPG4aoX3I7zjLmHt3AFoHGxSNFw4VWKdToCiKkk458NSNtV9SDu8zo2lqsiMf7MFZiq46da-OHUJIzvkpS5UcbMKX8RRXkLMeFBgZmtW7-9D4LGc2mxRdydvx_AskhWe_1eeUieZvBMWoP3xAn8e91O5ovIXLRSvdb2Y9w',
    is_verified: true
  }
};

const dummyStats = {
  totalUsers: 12480,
  totalProducts: 5600,
  todayUsers: 32,
  todayProducts: 150
};

const dummyUsers = [
  { id: 1, email: 'user1@example.com', name: '김철수', created_at: '2023-10-26' },
  { id: 2, email: 'user2@example.com', name: '이영희', created_at: '2023-10-25' },
  { id: 3, email: 'user3@example.com', name: '박민준', created_at: '2023-10-24' }
];

const dummyAdminProducts = [
  { id: 1, title: '프리미엄 울 코트', price: 250000, created_at: '2023-10-26', seller: { name: '스타일샵' } },
  { id: 2, title: '클래식 레더 부츠', price: 180000, created_at: '2023-10-25', seller: { name: '슈즈마스터' } },
  { id: 3, title: '캐시미어 스카프', price: 85000, created_at: '2023-10-24', seller: { name: '패션액세서리' } }
];

// 전역 변수 설정 (header.ejs에서 user 사용)
app.use((req, res, next) => {
  res.locals.user = dummyUser; // 로그인 상태로 테스트
  next();
});

// 테스트 라우트
app.get('/test/login', (req, res) => {
  res.render('auth/login', { error: null });
});

app.get('/test/product/list', (req, res) => {
  res.render('product/list', { products: dummyProducts });
});

app.get('/test/product/detail', (req, res) => {
  res.render('product/detail', { product: dummyProduct, user: dummyUser });
});

app.get('/test/product/write', (req, res) => {
  res.render('product/write', { product: null });
});

app.get('/test/user/profile', (req, res) => {
  res.render('user/profile', { user: dummyUser, products: dummyProducts });
});

app.get('/test/admin/dashboard', (req, res) => {
  res.render('admin/dashboard', { 
    stats: dummyStats,
    users: dummyUsers,
    adminProducts: dummyAdminProducts
  });
});

// 메인 페이지 (모든 테스트 페이지 링크)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>EJS 테스트 페이지</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
        a { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; }
        a:hover { background: #357ABD; }
      </style>
    </head>
    <body>
      <h1>🎯 EJS 템플릿 테스트 페이지</h1>
      <p>각 페이지를 클릭하여 렌더링 결과를 확인하세요.</p>
      <ul>
        <li><a href="/test/login">로그인 페이지</a></li>
        <li><a href="/test/product/list">상품 목록 페이지</a></li>
        <li><a href="/test/product/detail">상품 상세 페이지</a></li>
        <li><a href="/test/product/write">상품 등록 페이지</a></li>
        <li><a href="/test/user/profile">마이페이지</a></li>
        <li><a href="/test/admin/dashboard">관리자 대시보드</a></li>
      </ul>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🚀 테스트 서버가 실행되었습니다!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n📋 테스트할 수 있는 페이지:`);
  console.log(`   - 로그인: http://localhost:${PORT}/test/login`);
  console.log(`   - 상품목록: http://localhost:${PORT}/test/product/list`);
  console.log(`   - 상품상세: http://localhost:${PORT}/test/product/detail`);
  console.log(`   - 상품등록: http://localhost:${PORT}/test/product/write`);
  console.log(`   - 마이페이지: http://localhost:${PORT}/test/user/profile`);
  console.log(`   - 관리자대시보드: http://localhost:${PORT}/test/admin/dashboard`);
  console.log(`\n✨ 브라우저에서 위 주소를 열어 확인하세요!\n`);
});

