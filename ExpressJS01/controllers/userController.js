const { createUserService, loginService, getUserService } = require("../services/userService");

// Đăng ký user
const createUser = async (req, res) => {
  try {
    // Kiểm tra req.body
    if (!req.body) {
      return res.status(400).json({
        errorCode: -1,
        message: "Request body is required"
      });
    }

    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        errorCode: -1,
        message: "Name, email and password are required"
      });
    }

    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      errorCode: -1,
      message: "Internal server error"
    });
  }
}

// Login
const handleLogin = async (req, res) => {
  try {
    // Kiểm tra req.body
    if (!req.body) {
      return res.status(400).json({
        errorCode: -1,
        message: "Request body is required"
      });
    }

    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        errorCode: -1,
        message: "Email and password are required"
      });
    }

    const data = await loginService(email, password);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      errorCode: -1,
      message: "Internal server error"
    });
  }
}

// Lấy danh sách user
const getUser = async (req, res) => {
  try {
    const data = await getUserService();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      errorCode: -1,
      message: "Internal server error"
    });
  }
}

// Lấy thông tin account (đã xác thực)
const getAccount = async (req, res) => {
  return res.status(200).json(req.user);
}

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount
}