//==== 기본 모듈 불러오기 ====//
const express = require('express')
    , http = require('http')
    , path = require('path');

//==== 외장 모듈 불러오기 ====//
const static = require('serve-static')
    , bodyParser = require('body-parser');

//==== 익스프레스 객체 생성 ====//
const app = express();

//==== 익스프레스 기본 설정 ====//
// 기본 포트를 app 객체에 속성으로 설정
app.set('port', 3000);

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

//==== 데이터베이스 관련 ====//
let database;

// 몽고디비 모듈의 MongoClient 속성 참조
const MongoClient = require('mongodb').MongoClient;

function connectDB(){
    // 데이터베이스 연결 정보
    const databaseUrl = 'mongodb://localhost:27017/local';
    const option = { useUnifiedTopology: true }
    // 데이터베이스 연결
    MongoClient.connect(databaseUrl, option, function(err, db){
        if (err) throw err;

        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        // database 변수에 할당
        database = db.db('local');
    });
}

//==== 사용자 관련 ====//
// 사용자를 인증하는 함수
const authUser = function(database, id, password, callback){
    console.log('authUser 호출됨');

    // User 컬렉션 참조
    const users = database.collection('users');

    // 아이디와 비밀번호를 사용해 검색
    users.find({'id': id, 'password': password}).toArray(function(err, docs){
        if(err){ callback(err, null); return; }

        if(docs.length > 0){
            console.log('아이디 [%s], 비밀번호 [%s]가 일치하는 사용자 찾음.', id, password);
            callback(null, docs);
        } else{
            console.log('아이디 [%s], 비밀번호 [%s]가 일치하는 사용자를 찾지 못함', id, password);
            callback(null, null);
        }
    });
}

// 사용자를 추가하는 함수
const addUser = function(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

    // users 컬렉션 참조
    const users = database.collection('users');

    // 사용자 추가
    users.insertMany([{'id': id, 'password': password, 'name': name}], function(err, result) {
        if(err) {callback(err, null); return;}

        // 콜백 함수를 호출하면서 결과 객체 전달
        if(result.insertedCount > 0){
            console.log('사용자 레코드 추가됨 : ' + result.insertedCount);
        } else{
            console.log('추가된 레코드없음');
        }

        callback(null, result);
    });
}

//==== 라우팅 관련 ====//
const router = express.Router();

router.route('/process/login').post(function(req, res){
    console.log('/process/login 호출됨');

    const paramId = req.body.id;
    const paramPassword = req.body.password;

    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err) {throw err;}

            if(docs){
                const username = docs[0].name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
                res.write('<br><br><a href=/ch06/public/login.html>다시 로그인하기</a>');
                res.end();
            } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
                res.write('<br><br><a href=/ch06/public/login.html>다시 로그인하기</a>');
                res.end();
            }
        });
    } else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
    }
});

router.route('/process/adduser').post(function(req, res){
    console.log('/process/adduser 호출됨');

    const paramId = req.body.id;
    const paramPassword  = req.body.password;
    const paramName = req.body.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramName + ', ' + paramName);

    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            // 추가된 데이터가 있으면 성공 응답 전송
            if(result && result.insertedCount > 0){
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가  실패</h2>');
                res.end();
            }
        });

    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

// 라우터 객체 등록
app.use('/', router);

// 404 에러 처리
app.all('*', function(req, res){
    res.status(404).send('<p>ERROR - 페이지를 찾을 수 없습니다.</p>');
})

//==== 서버 시작 ====//
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ', + app.get('port'));

    connectDB();
});