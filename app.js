// 기본 모듈 불러오기
const express = require('express')
    , http = require('http')
    , path = require('path');

// express 미들웨어 불러오기
const static = require('serve-static')
    , bodyParser = require('body-parser')
    , expressSession = require('express-session')
    , expressErrorHandler = require('express-error-handler');

//==== 익스프레스 객체 생성 ====//
const app = express();


//==== 익스프레스 기본 설정 ====//
const config = require('./config/config');

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', config.server_port);

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// 세션 설정
app.use(expressSession({secret:'my key', resave:true, saveUninitialized:true}));


//==== 뷰 관련 ====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//==== 데이터베이스 관련 ====//
const database = require('./database/database');

database.init(app, config);


//==== 패스포트 설정 ====//
const passport = require('passport');
const flash = require('connect-flash');
const configPassport = require('./config/passport');

app.use(passport.initialize())
app.use(passport.session());
app.use(flash());

configPassport(app, passport);


//==== 라우팅 관련 ====//
const route_loader = require('./routes/route_loader');
const userPassport = require('./routes/user_passport');
const router = express.Router();

route_loader.init(app, router);
userPassport(router, passport);



//==== 에러 핸들러 ====//
const errorHandler = expressErrorHandler({
    static: {'404': './public/404.html'}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


//==== 서버 시작 ====//
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', + app.get('port'));
});