require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

// Đăng ký user
const createUserService = async (name, email, password) => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const user = await User.findOne({ email });
    if (user) {
      console.log(`>>> user exist, chọn 1 email khác: ${email}`);
      return null;
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Lưu user vào database
    let result = await User.create({
      name: name,
      email: email,
      password: hashPassword,
      role: 'User'
    });

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Đăng nhập user
const loginService = async (email, password) => {
  try {
    // Lấy user theo email
    const user = await User.findOne({ email: email });
    if (!user) {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ"
      };
    }

    // So sánh password
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return {
        EC: 2,
        EM: "Email/Password không hợp lệ"
      };
    }

    // Tạo access token
    const payload = {
      email: user.email,
      name: user.name
    };

    // Debug log
    console.log(">>> JWT_EXPIRE value:", process.env.JWT_EXPIRE);
    console.log(">>> JWT_EXPIRE type:", typeof process.env.JWT_EXPIRE);

    const access_token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "24h" // Hardcode tạm thời để test
      }
    );

    return {
      EC: 0,
      access_token,
      user: {
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Lấy danh sách user
const getUserService = async () => {
  try {
    let result = await User.find({}).select("-password");
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  createUserService,
  loginService,
  getUserService
};