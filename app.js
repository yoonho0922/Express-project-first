// 기본 모듈 불러오기
const express = require('express')
    , http = require('http')
    , path = require('path');

// express 미들웨어 불러오기
const static = require('serve-static')
    , bodyParser = require('body-parser')
    , expressErrorHandler = require('express-error-handler');

//==== 익스프레스 객체 생성 ====//
const app = express();


//==== 익스프레스 기본 설정 ====//
const config = require('./config');

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', config.server_port);

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())


//==== 뷰 관련 ====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//==== 데이터베이스 관련 ====//
const database = require('./database/database');

database.init(app, config);

//==== 라우팅 관련 ====//
const route_loader = require('./routes/route_loader');
const router = express.Router();

route_loader.init(app, router);

router.route('/').get(function(req, res){
    console.log('/ 패스 요청됨.');
    res.render('index.ejs');
});

router.route('/login').get(function(req, res){
    console.log('/login 패스 요청됨.');
    res.render('login.ejs');
})

router.route('/signup').get(function(req, res) {
    console.log('/signup 패스 요청됨.');
    res.render('signup.ejs');
});

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