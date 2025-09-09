require('dotenv').config(); // đọc file .env
require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('../routes/api'); // Sửa từ './routes/api' thành '../routes/api'
const connection = require('./config/database');
const { getHomepage } = require('../controllers/homeController'); // Sửa từ './controllers/homeController' thành '../controllers/homeController'
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8888;  // nếu không có PORT trong .env thì chạy port 8888
app.use(cors()); // cho phép CORS
app.use(express.json()); // parse body JSON
app.use(express.urlencoded({ extended: true })); // parse form data
configViewEngine(app); // cấu hình view engine (EJS)
const webAPI = express.Router();
webAPI.get("/", getHomepage); 
app.use('/', webAPI);  // gắn route web API
app.use('/v1/api', apiRoutes);  // gắn route API version 1
(async () => {
  try {
    await connection(); // kết nối MongoDB
    app.listen(port, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();