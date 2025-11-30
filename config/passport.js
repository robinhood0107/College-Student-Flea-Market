//공부

//이 파일 LocalStrategy이다!

//passport.js이라는 파일이름이지 실질적으로는 노드버드에서 배웠듯 LocalStrategy 설정하는 파일이다
//보통 passport.js로 이름짓는다 함

//로그인 폼(login.ejs)에서 POST /auth/login 요청
//    passport.js에서 req.body.email, req.body.password 전송

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // models/User.js 사용 (DB 쿼리 함수)

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: false
        //local strategy객체의 프로퍼티를 뭐로 할 것인지 정하는 곳
    }, async (email, password, done) => {
        try {
            const user = await User.findByEmail(email);
            //user.js에서 findByEmail함수 만들어 놓음(반환값은 "mysql2 인스턴스"인거 잊지말기)
            
            //일단 회원이 존재하는지 확인
            if (!user) {
                return done(null, false, { message: '가입되지 않은 회원입니다.' });
            }

            // 비밀번호 검증 (bcrypt.compare)
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {// Ture값 --> 이제 user 객체를 세션에 저장해야 됨
                //user 객체에서 password 프로퍼티만 삭제하고 세션에 저장하는 방법이 이것
                
                //개인 공부용 주석 정리 //문법 약간 헷깔리니 잘 보기
                
                //구조분해 할당에서 "_" 값과 Rest 연산자 (...) 사용법
                //1. 애초에 "구조 분해 할당"이 말만 어렵지 많이 쓰던 것임
                    //예시: const { id, email, nickname } = user;
                    // 결과:
                    // id = 1
                    // email = 'test@example.com'
                    // nickname = '홍길동
                    //이런식으로 값을 뽑아내는 것이 구조분해 할당이다 

                //2. _는 관례상 무시할 값을 담는 변수명이기 때문에 { password: _ } 이런식으로 쓰면 값이 의미없는 값이 된다.

                //3. Rest 연산자 (...) 사용법
                    // 나머지 모든 프로퍼티를 하나의 객체로 모음
                    //예시: const { password, ...rest } = user;
                    // 결과:
                    // password = '$2a$10$hashed...'
                    // rest = {
                    //     id: 1,
                    //     email: 'test@example.com',
                    //     nickname: '홍길동',
                    //     campus: '서울캠퍼스',
                    //     profile_img: null,
                    //     isAdmin: false
                    // }
                    //이런식으로 password를 제외한 나머지 프로퍼티를 모아 rest 객체에 저장하는 것
                    //즉, 다시 말하면 "rest"라는 객체에 password를 제외한 나머지 프로퍼티들이 저장된다.
                
                //결론
                //password: _ 이렇게 하면 password 프로퍼티는 무시하고 
                //나머지 프로퍼티들을 userWithoutPassword 객체에 저장하는 것

                const { password: _, ...userWithoutPassword } = user;
                return done(null, userWithoutPassword);
            } else {
                // 비밀번호 불일치
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (err) {
            // 에러 발생 시
            console.error('Passport 인증 에러:', err);
            return done(err);
        }
    }));

    // 직렬화(세션에 사용자 정보 저장하는 것!)
    passport.serializeUser((user, done) => {
        // 세션으로 사용자 ID만 활용하기 때문에 ID만 저장해도 된다.
        done(null, user.id);
        //이렇게 할 경우 매 요청마다 DB에서 최신 정보 조회하고
        /*
        -- sessions 테이블 구조
        session_id: 'abc123...'  -- 쿠키에 저장되는 세션 ID
        expires: 1234567890      -- 만료 시간
        data: '{"passport":{"user":1}}'
        //이런식으로 data에 '{"passport":{"user":1}}'라는 객체가 저장된다.
        */

    });

    // 역직렬화(세션에서 사용자 정보 복원하는 것)
    passport.deserializeUser(async (id, done) => {
        // 세션에서 사용자 ID를 가져와서 DB에서 사용자 정보 조회할때 사용하는 함수
        try {
            // models/user.js에서 findById함수 만들어 놓았으니 사용하자
            const user = await User.findById(id);
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (err) {
            console.error('Deserialize 에러:', err);
            done(err);
        }
    });
}