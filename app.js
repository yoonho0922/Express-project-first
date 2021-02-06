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


//==== 데이터베이스 관련 ====//
const database = require('./database/database');

database.init(app, config);

//==== 라우팅 관련 ====//
const route_loader = require('./routes/route_loader');

route_loader.init(app, express.Router());

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