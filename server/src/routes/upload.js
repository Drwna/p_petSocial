const express = require('express');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// 上传单张图片
router.post('/single', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '请选择要上传的图片'
      });
    }

    // 生成图片URL
    const imageUrl = `${req.protocol}://${req.get('host')}/public/images/${req.file.filename}`;

    res.json({
      code: 0,
      msg: '图片上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: '图片上传失败',
      error: error.message
    });
  }
});

// 上传多张图片（最多9张）
// router.post('/multiple', auth, upload.array('images', 9), (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         code: 400,
//         msg: '请选择要上传的图片'
//       });
//     }

//     // 生成图片URL列表
//     const imageUrls = req.files.map(file => {
//       return {
//         url: `${req.protocol}://${req.get('host')}/public/images/${file.filename}`,
//         filename: file.filename,
//         size: file.size
//       };
//     });

//     res.json({
//       code: 0,
//       msg: '图片上传成功',
//       data: {
//         images: imageUrls
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       code: 500,
//       msg: '图片上传失败',
//       error: error.message
//     });
//   }
// });

module.exports = router;