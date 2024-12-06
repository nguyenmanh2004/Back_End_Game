const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Cài đặt cổng cho server
const PORT = process.env.PORT || 3000;

// Chuỗi kết nối MongoDB
const connectionString = "mongodb+srv://nguyenmanh2004devgame:nguyenmanh2004@dtbdevgame.5bwtj.mongodb.net/user-game-1";


// Middleware để phân tích cú pháp JSON
app.use(express.json());

// Kết nối tới MongoDB Atlas
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Định nghĩa schema và model cho người dùng
const userSchema = new mongoose.Schema({
  thong_tin_nguoi_dung: {
    ten_nguoi_dung: String,
    email: String,
    mat_khau: String
  },
  tai_nguyen: {
    vang: Number,
    kim_cuong: Number
  },
  chi_so: {
    mau: Number,
    mana: Number,
    tan_cong: Number,
    giap: Number,
    chinh_xac: Number,
    toc_chay: Number,
    ti_le_crit: Number,
    sat_thuong_crit: Number,
    ti_le_ne: Number,
    giam_thuong: Number
  }
});

const User = mongoose.model('User', userSchema, 'info'); // 'info' là tên collection

// Route để lấy tất cả các database và collections
app.get('/databases', async (req, res) => {
  try {
    const client = mongoose.connection.client; // Lấy client MongoDB từ mongoose
    const admin = client.db().admin(); // Truy xuất admin database để thực hiện các câu lệnh hệ thống

    // Lấy danh sách các database
    const databases = await admin.listDatabases();
    const dbNames = databases.databases.map((db) => db.name); // Chỉ lấy tên các database
    
    // Lấy collections cho mỗi database
    const collectionsInfo = {};

    for (const dbName of dbNames) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      collectionsInfo[dbName] = collections.map((col) => col.name); // Lấy tên các collection
    }

    // Trả về danh sách database và collections
    res.json(collectionsInfo);
  } catch (err) {
    console.error('Error fetching databases and collections:', err);
    res.status(500).send('Error fetching databases and collections');
  }
});

app.get('/user/:ten_nguoi_dung', async (req, res) => {
    const tenNguoiDung = req.params.ten_nguoi_dung; // Lấy tên người dùng từ URL
    console.log(`Tìm người dùng với tên: ${tenNguoiDung}`);  // Log tên người dùng
  
    try {
      // Tìm người dùng theo tên người dùng
      const user = await User.findOne({ "thong_tin_nguoi_dung.ten_nguoi_dung": tenNguoiDung });
      
      if (user) {
        console.log('Tìm thấy người dùng:', user);  // Log người dùng đã tìm thấy
        res.json(user); // Trả về người dùng tìm thấy dưới dạng JSON
      } else {
        console.log('Không tìm thấy người dùng');  // Log khi không tìm thấy người dùng
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error fetching user by username:', err);
      res.status(500).send('Error fetching user by username');
    }
  });
  app.get('/users/:vang', async (req, res) => {
    const vang = req.params.vang; // Lấy tên người dùng từ URL
    console.log(`Tìm vàng với số vàng: ${vang}`);  // Log tên người dùng
  
    try {
      // Tìm người dùng theo tên người dùng
      const user = await User.findOne({ "tai_nguyen.vang": vang});
      
      if (user) {
        console.log('Tìm thấy người dùng vs vang:', user);  // Log người dùng đã tìm thấy
        res.json(user); // Trả về người dùng tìm thấy dưới dạng JSON
      } else {
        console.log('Không tìm thấy người dùng co so vang do');  // Log khi không tìm thấy người dùng
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error fetching user by username:', err);
      res.status(500).send('Error fetching user by username');
    }
  });
  app.post('/user', async (req, res) => {
    const { ten_nguoi_dung, email, mat_khau, vang, kim_cuong, chi_so } = req.body;
  
    if (!ten_nguoi_dung || !email || !mat_khau || vang === undefined || kim_cuong === undefined || !chi_so) {
      return res.status(400).send('Missing required fields');
    }
  
    try {
      const newUser = new User({
        thong_tin_nguoi_dung: {
          ten_nguoi_dung,
          email,
          mat_khau
        },
        tai_nguyen: {
          vang,
          kim_cuong
        },
        chi_so
      });
  
      await newUser.save();
      console.log('New user added:', newUser); // Log thông tin người dùng vừa thêm
      res.status(201).json(newUser);
    } catch (err) {
      console.error('Error adding new user:', err);
      res.status(500).send('Error adding new user');
    }
  });
  // PUT để sửa thông tin người dùng
app.put('/user/:ten_nguoi_dung', async (req, res) => {
    const tenNguoiDung = req.params.ten_nguoi_dung;  // Lấy tên người dùng từ URL
    const { ten_nguoi_dung, email, mat_khau, vang, kim_cuong, chi_so } = req.body;
  
    try {
      // Tìm và cập nhật thông tin người dùng
      const updatedUser = await User.findOneAndUpdate(
        { "thong_tin_nguoi_dung.ten_nguoi_dung": tenNguoiDung },  // Tìm theo tên người dùng
        {
          $set: {
            "thong_tin_nguoi_dung.ten_nguoi_dung": ten_nguoi_dung || undefined,
            "thong_tin_nguoi_dung.email": email || undefined,
            "thong_tin_nguoi_dung.mat_khau": mat_khau || undefined,
            "tai_nguyen.vang": vang || undefined,
            "tai_nguyen.kim_cuong": kim_cuong || undefined,
            "chi_so": chi_so || undefined
          }
        },
        { new: true }  // Trả về người dùng đã được cập nhật
      );
  
      if (updatedUser) {
        console.log('User updated:', updatedUser);
        res.json(updatedUser);  // Trả về thông tin người dùng đã sửa
      } else {
        console.log('User not found');
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Error updating user');
    }
  });
  
  // DELETE để xóa người dùng
  app.delete('/user/delete/:ten_nguoi_dung', async (req, res) => {
    const tenNguoiDung = req.params.ten_nguoi_dung;  // Lấy tên người dùng từ URL
  
    try {
      const deletedUser = await User.findOneAndDelete({ "thong_tin_nguoi_dung.ten_nguoi_dung": tenNguoiDung });
  
      if (deletedUser) {
        console.log('User deleted:', deletedUser);
        res.json(deletedUser);  // Trả về người dùng đã xóa
      } else {
        console.log('User not found');
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user');
    }
  });
  
  // DELETE để xóa người dùng theo ID
  app.delete('/user/id/:id', async (req, res) => {
    const userId = req.params.id;  // Lấy ID người dùng từ URL
  
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (deletedUser) {
        console.log('User deleted:', deletedUser);
        res.json(deletedUser);  // Trả về người dùng đã xóa
      } else {
        console.log('User not found');
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error deleting user by ID:', err);
      res.status(500).send('Error deleting user by ID');
    }
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
