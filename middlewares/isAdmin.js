module.exports = function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  // boolean이 아니라 숫자로 오는 경우가 대부분
  if (req.user.isAdmin !== 1) {
    return res.status(403).send("관리자만 접근 가능합니다.");
  }

  next();
};
