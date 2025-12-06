const User = require('../models/User');
const Product = require('../models/Product');

const adminController = {

  // 관리자 대시보드
  async dashboard(req, res) {
    try {
      const users = await User.findAll({ limit: 50 });
      const products = await Product.findAll({}, null);

      const stats = {
        totalUsers: users.length,
        totalProducts: products.length,
        todayUsers: 0,
        todayProducts: 0
      };

      return res.render('admin/dashboard', {
        stats,
        users,
        adminProducts: products
      });

    } catch (err) {
      console.error("대시보드 오류:", err);
      return res.status(500).send("관리자 대시보드 로딩 오류");
    }
  },

  // 전체 회원 목록
  async getUsers(req, res) {
    try {
      const users = await User.findAll({ limit: 200 });
      return res.render('admin/users', { users });
    } catch (err) {
      console.error("회원 목록 오류:", err);
      return res.status(500).send("회원 목록 불러오기 오류");
    }
  },

  // 회원 삭제
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      const success = await User.delete(userId);
      if (!success) {
        return res.status(404).send("해당 회원이 존재하지 않습니다.");
      }

      return res.status(200).json({ message: "회원 삭제 완료" });

    } catch (err) {
      console.error("회원 삭제 오류:", err);
      return res.status(500).send("회원 삭제 중 오류 발생");
    }
  },

  // 전체 상품 목록 조회
  async getProducts(req, res) {
    try {
      const products = await Product.findAll({}, null);
      return res.render('admin/products', { products });
    } catch (err) {
      console.error("상품 목록 오류:", err);
      return res.status(500).send("상품 목록 불러오기 오류");
    }
  },

  // 상품 삭제
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;

      const success = await Product.delete(productId);
      if (!success) {
        return res.status(404).send("해당 상품이 존재하지 않습니다.");
      }

      return res.status(200).json({ message: "상품 삭제 완료" });

    } catch (err) {
      console.error("상품 삭제 오류:", err);
      return res.status(500).send("상품 삭제 중 오류 발생");
    }
  }
};

module.exports = adminController;
