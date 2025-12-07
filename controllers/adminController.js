const User = require('../models/User');
const Product = require('../models/Product');

const adminController = {

  // 관리자 대시보드
  async dashboard(req, res) {
    try {
      // 전체 회원 수 조회
      const totalUsers = await User.countAll();

      // 전체 상품 수 조회
      const totalProducts = await Product.countAll();

      // 오늘 날짜 기준 신규 가입자 수 조회
      const todayUsers = await User.countToday();

      // 오늘 날짜 기준 신규 상품 수 조회
      const todayProducts = await Product.countToday();

      const stats = {
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        todayUsers: todayUsers,
        todayProducts: todayProducts
      };

      return res.render('admin/dashboard', {
        stats
      });

    } catch (err) {
      console.error("대시보드 오류:", err);
      return res.status(500).send("관리자 대시보드 로딩 오류");
    }
  }
};

module.exports = adminController;
