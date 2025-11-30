// 로그인 여부 확인 미들웨어
// 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트


module.exports = (req, res, next) => {
    // req.user는 passport.deserializeUser에서 설정됨
    if (req.user) {
        // 로그인된 사용자는 다음 미들웨어로 진행
        //이렇게 next를 사용해서 넘겨줌!
        return next();
    }
    
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    // 원래 가려던 URL을 쿼리 파라미터로 저장 (로그인 후 돌아오기 위함)

    const returnTo = req.originalUrl || req.url;
    res.redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
};

