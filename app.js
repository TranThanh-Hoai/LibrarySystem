var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var bookRoutes = require('./routes/books');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
//localhost:3000/books
app.use('/api/books', require('./routes/books'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

//localhost:3000/users
//app.use('/api/v1/users', require('./routes/users'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/publishers', require('./routes/publishers'));
app.use('/api/notifications', require('./routes/notifications'));

require('dotenv').config();

const { seedRoles } = require('./config/initDB');

// URI
const atlasURI = process.env.MONGO_URI;
const localURI = "mongodb://localhost:27017/LibrarySystem";

// ưu tiên Atlas nếu có, không thì local
let currentURI = atlasURI || localURI;

// connect function
async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(
      uri === localURI
        ? "✅ MongoDB Local: Connected"
        : "✅ MongoDB Atlas: Connected"
    );

    await seedRoles();

  } catch (err) {
    console.log("❌ Connect lỗi:", err.message);

    // nếu đang dùng Atlas thì fallback local
    if (uri === atlasURI) {
      console.log("🔄 Switching to LOCAL DB...");
      return connectDB(localURI);
    } else {
      console.log("💥 Local cũng lỗi luôn, thoát...");
      process.exit(1);
    }
  }
}

// chạy connect
connectDB(currentURI);

// events
mongoose.connection.on('error', (err) => {
  console.log("❌ MongoDB Error:", err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log("⚠️ MongoDB: Disconnected");
});

mongoose.connection.on('disconnecting', () => {
  console.log("⏳ MongoDB: Disconnecting...");
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
