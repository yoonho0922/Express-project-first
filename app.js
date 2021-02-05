// Express 기본 모듈 불러오기
var express = require('express')
    , http = require('http')
    , path = require('path');

var static = require('serve-static');

var app = express();

// 기본 포트를 app 객체에 속성으로 설정
app.set('port', 3000);

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// 404 에러 처리
app.all('*', function(req, res){
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
})

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', + app.get('port'));
});