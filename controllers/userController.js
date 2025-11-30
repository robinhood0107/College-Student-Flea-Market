const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const userController = {
    // GET /user/profile - 마이페이지
    async profile(req, res) {
        try {
            const tab = req.query.tab || 'sales';
            const showEditForm = req.query.edit === 'true'; // ?edit=true 쿼리 파라미터로 폼 표시
            
            // 현재 로그인한 사용자 정보 가져오기

            // 개인 공부용 설명 (중요)
            // 이 설명을 이해할 수 있어야 함!!
            // passport.deserializeUser에서 User.findById로 가져온 데이터를 done(null, user)로 반환하면
            // Passport.js가 자동으로 req.user에 저장함 (app.js의 passport.session() 미들웨어가 처리)
            const user = req.user || null;

            // 사용자 ID가 없으면 로그인 페이지로 리다이렉트
            if (!user || !user.id) {
                return res.redirect('/auth/login');
            }

            let products = [];
            
            // 탭에 따라 다른 상품 목록 가져오기
            if (tab === 'wishlist') {
                // 찜한 목록: 사용자가 찜한 상품들 <- 이거 model/Product.js에서 미리 구현해둠!!!
                products = await Product.findLikedByUser(user.id);
            } else {
                // 판매 내역: 사용자가 판매한 상품들 <- 이거 model/Product.js에서 미리 구현해둠!!!
                products = await Product.findBySellerId(user.id);
            }
            












            //여기서 Grid 나중에 라우터로 연결하면서 수정 필요
            //(미완성)














            
            res.render('user/profile', {
                user: user,
                products: products,
                tab: tab,
                showEditForm: showEditForm,
                error: req.query.error || null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('프로필 페이지 에러:', error);
            res.redirect('/user/profile?error=페이지를 불러오는 중 오류가 발생했습니다.');
        }
    },

    // POST /user/edit - 프로필 수정 처리
    async update(req, res) {
        try {
            const userId = req.user.id;
            const { nickname, password, passwordConfirm, campus } = req.body;
            
            // 입력값 검증
            if (!nickname || nickname.trim() === '') {
                return res.redirect('/user/profile?error=닉네임을 입력해주세요.');
            }
            
            // 비밀번호 검증
            if (password) {
                // 비밀번호 길이 확인 (최소 12자)
                if (password.length < 12) {
                    return res.redirect('/user/profile?error=비밀번호는 최소 12자 이상이어야 합니다.');
                }
                // 비밀번호 일치 확인
                if (password !== passwordConfirm) {
                    return res.redirect('/user/profile?error=비밀번호가 일치하지 않습니다.');
                }
            }
            
            // 사용자 정보 업데이트 데이터 준비
            const updateData = {
                nickname: nickname.trim(),
                campus: campus && campus.trim() !== '' ? campus.trim() : null
            };
            
            // 비밀번호 변경이 있으면 해싱
            if (password && password.trim() !== '') {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }
            
            await User.update(userId, updateData);
            
            res.redirect('/user/profile?success=프로필이 수정되었습니다.');
        } catch (error) {
            console.error('프로필 수정 에러:', error);
            res.redirect('/user/profile?error=프로필 수정 중 오류가 발생했습니다.');
        }
    }
};

module.exports = userController;
