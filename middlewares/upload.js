const multer = require('multer');
const path = require('path');
const fs = require('fs');
 

// 업로드 폴더 경로
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');

// 폴더 없으면 생성
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// 허용 확장자
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// 저장 방식 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

// 확장자 필터
function fileFilter(req, file, done) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return done(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
    }
    done(null, true);
}

// multer 설정
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter
});
 
module.exports = upload;
