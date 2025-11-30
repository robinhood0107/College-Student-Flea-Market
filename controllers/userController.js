const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
    // GET /user/profile - 마이페이지
    async profile(req, res) {
        try {
            const tab = req.query.tab || 'sales';
            const showEditForm = req.query.edit === 'true'; // ?edit=true 쿼리 파라미터로 폼 표시
            
            // 현재 로그인한 사용자 정보 가져오기
            // req.user는 passport.deserializeUser에서 설정됨 (User.findById로 가져온 데이터)
            // 필드: id, email, nickname, campus, profile_img, isAdmin, created_at
            const user = req.user || null;










            
            // TODO: 사용자의 상품 목록 가져오기 (나중에 구현)
            const products = [];
            //미구현 상태!!!!
            
















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
