//공부

//컨트롤러 개념
/*
//이런걸 MVC 패턴이라고 한다

사용자 요청
    ↓
Routes (라우터) - URL 경로 정의
    ↓
Controllers (컨트롤러) - 비즈니스 로직 처리
    ↓
Models (모델) - DB 쿼리 실행
    ↓
Database (데이터베이스)
    ↓
Controllers - 응답 처리
    ↓
Views (뷰) - HTML 렌더링
    ↓
사용자에게 응답
*/
//보통 이런 구조를 가지게 됨

//중요한 것은 routes에서 url을 가공해서 controllers에 넘겨주고 처리하는 것
//그니깐 실질적인 로그인 승인 처리라던가 회원가입 처리라던가 하는 것들을 여기서 처리하는 것


const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

//GET /auth/join
const authController = {
    getJoinPage(req, res) {
        res.render('auth/login', { 
            error: null,
            email: null,
            showJoinForm: true  // 회원가입 폼을 보여주기 위한 플래그
            //ejs의 태그 js 문법에서 이걸 받아서 삼항연산자로 css 결정한다
        });
    },
    //GET /auth/login
    getLoginPage(req, res) {
        // 이미 로그인된 사용자는 상품 목록으로 리다이렉트
        if (req.user) {
            return res.redirect('/product/list');
        }

        //개인 공부용 추가 설명
        // URL 쿼리 파라미터에서 success 메시지 읽기
        // 예: /auth/login?success=회원가입이 완료되었습니다
        // → req.query = { success: "회원가입이 완료되었습니다" }
        // → req.query.success로 값 읽기
        // 없으면 null (|| null)
        const success = req.query.success || null;
        const returnTo = req.query.returnTo || null; // 원래 가려던 페이지
        
        res.render('auth/login', { 
            error: null,
            email: null,
            showJoinForm: false,  // 로그인 폼을 보여주기 위한 플래그
            success: success,  // 회원가입 성공 메시지 (뷰에서 <%= success %>로 표시)
            returnTo: returnTo  // 로그인 후 돌아갈 페이지
        });
    },

    //POST /auth/join 회원가입 처리
    //여기서 해야 할 건 총 4가지
    //1. 입력값 검증 (이메일 중복, 비밀번호 일치 확인)
    //2. bcrypt로 비밀번호 암호화
    //3. DB에 사용자 저장 (User.create)
    //4. 로그인 페이지로 리다이렉트
    async join(req, res) {
        try {
            const { email, password, passwordConfirm, name, campus } = req.body;

            // 입력값 검증
            if (!email || !password || !passwordConfirm || !name) {
                return res.render('auth/login', {
                    error: '모든 필드를 입력해주세요.',
                    email: email || '',
                    showJoinForm: true  // 회원가입 폼 유지하기!
                });
            }

            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.render('auth/login', {
                    error: '올바른 이메일 형식을 입력해주세요.',
                    email: email || '',
                    showJoinForm: true
                });
            }

            // 비밀번호 일치 확인
            if (password !== passwordConfirm) {
                return res.render('auth/login', {
                    error: '비밀번호가 일치하지 않습니다.',
                    email: email,
                    showJoinForm: true  // 회원가입 폼 유지하기!
                });
            }

            // 비밀번호 길이 확인 (최소 12자로 하자)
            if (password.length < 12) {
                return res.render('auth/login', {
                    error: '비밀번호는 최소 12자 이상이어야 합니다.',
                    email: email,
                    showJoinForm: true  // 회원가입 폼 유지하기!
                });
            }

            // 이메일 중복 확인(생각해보면 당연한 거라서 추가)
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.render('auth/login', {
                    error: '이미 가입된 이메일입니다.',
                    email: email,
                    showJoinForm: true  // 회원가입 폼 유지하기!
                });
            }

            // bcrypt로 비밀번호 암호화 (salt rounds: 10)
            // bcrypt.hash는 비동기 함수이므로 await 필요
            const hashedPassword = await bcrypt.hash(password, 10);

            // 사용자 생성 (nickname 필드에 name 값 사용)
            const userData = {
                email: email,
                password: hashedPassword,  // 암호화된 비밀번호 저장
                nickname: name,
                campus: campus || null  // 선택사항: 입력값이 있으면 사용, 없으면 null
            };

            await User.create(userData);

            //개인 공부용 추가 설명
            // 회원가입 성공 시 로그인 페이지로 리다이렉트
            // ?success=... 는 URL 쿼리 파라미터로 메시지를 전달하는 방법
            // 리다이렉트 흐름:
            // 1. res.redirect() → 브라우저가 /auth/login?success=... 로 이동
            // 2. Express가 GET /auth/login 요청 처리
            // 3. getLoginPage 함수에서 req.query.success로 메시지 읽기
            // 4. 뷰에 전달하여 화면에 표시
            res.redirect('/auth/login?success=회원가입이 완료되었습니다. 로그인해주세요.');

        } catch (error) {
            console.error('회원가입 에러:', error);
            res.render('auth/login', {
                error: '회원가입 중 오류가 발생했습니다.',
                email: req.body.email || '',
                showJoinForm: true  // 회원가입 폼 유지
            });
        }
    },


    //POST /auth/login 로그인
    // 1. passport.authenticate('local') 미들웨어 사용
    // 2. passport.js의 LocalStrategy가 자동으로 검증
    // 3. 성공 시 세션에 사용자 정보 저장
    // 4. 홈 페이지로 리다이렉트
    login(req, res, next) {
        // passport.authenticate('local') 미들웨어 사용
        // 'local'은 passport.js에서 등록한 LocalStrategy 이름
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error('로그인 에러:', err);
                return res.render('auth/login', {
                    error: '로그인 중 오류가 발생했습니다.',
                    email: req.body.email || ''
                });
            }

            if (!user) {
                // 인증 실패
                return res.render('auth/login', {
                    error: '이메일 또는 비밀번호가 올바르지 않습니다.',
                    email: req.body.email || ''
                });
            }

            // 성공했으니까 req.login()으로 세션에 사용자 정보 저장하는 것
            req.login(user, (loginErr) => {
                if (loginErr) {
                    console.error('세션 저장 에러:', loginErr);
                    return res.render('auth/login', {
                        error: '세션 저장 중 오류가 발생했습니다.',
                        email: req.body.email || ''
                    });
                }

                // 로그인 성공 시 원래 가려던 페이지로 리다이렉트 (있으면)
                // 없으면 상품 목록 페이지로 리다이렉트
                const returnTo = req.body.returnTo || req.query.returnTo;
                if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('/auth')) {
                    return res.redirect(returnTo);
                }
                return res.redirect('/product/list');
            });
        })(req, res, next);
    },

    //GET /auth/logout 로그아웃
    logout(req, res) {
        // 세션 쿠키 이름 가져오기 (app.js에서 설정한 'sessionId' 사용)
        const sessionCookieName = req.session.cookie.name || 'sessionId';
        
        // Passport.js의 req.logout()으로 사용자 정보 제거
        req.logout((err) => {
            if (err) {
                console.error('로그아웃 에러:', err);
            }
            
            // 세션 완전히 삭제 (즉시 삭제)
            req.session.destroy((destroyErr) => {
                if (destroyErr) {
                    console.error('세션 삭제 에러:', destroyErr);
                }
                
                // 쿠키 즉시 삭제 (세션 쿠키)
                res.clearCookie(sessionCookieName, {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                
                // 로그아웃 후 리다이렉트
                res.redirect('/');
            });
        });
    }
};

module.exports = authController;

