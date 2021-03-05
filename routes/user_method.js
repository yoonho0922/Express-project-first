const login = function(req, res){
    console.log('/process/login 호출됨');

    const paramId = req.body.id;
    const paramPassword = req.body.password;

    const database = req.app.get('database');

    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err) {throw err;}

            if(docs){
                const username = docs[0].name;

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

                // 뷰 템플릿을 사용하여 렌더링한 후 전송
                const context = {userid: paramId, username: username};
                req.app.render('login_success', context, function(err, html) {
                    if (err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    console.log('login_success 렌더링 완료');
                    res.end(html);
                });

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
}

const adduser = function(req, res){
    console.log('/process/adduser 호출됨');

    const paramId = req.body.id;
    const paramPassword  = req.body.password;
    const paramName = req.body.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramName + ', ' + paramName);

    const database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if(database){
        addUser(database, paramId, paramPassword, paramName, function(err, result){
            if(err) {throw err;}

            // 추가된 데이터가 있으면 성공 응답 전송
            if(result){
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                var context = {title: '사용자 추가 성공'};
                req.app.render('adduser', context, function(err, html) {
                    if (err) {
                        console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                    console.log('adduser 렌더링 완료');
                    res.end(html);
                });

            } else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });

    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

// 사용자를 인증하는 함수
const authUser = function(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id);

    // 아이디와 비밀번호를 사용해 검색
    database.UserModel.findById(id, function(err, results){
        if (err) {callback(err, null); return}

        if (results.length > 0) {
            console.log('[%s] 아이디와 일치하는 사용자 찾음', id);

            // 비밀번호 확인 : 모델 인스턴스를 객체를 만들고 authenticate() 메소드 호출
            const user = new database.UserModel({id:id});
            const authenticated = user.authenticate(password, results[0].salt, results[0].hashed_password);

            if (authenticated) {
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }

        } else {
            console.log('[%s] 아이디와 일치하는 사용자를 찾지 못함', id);
            callback(null, null);
        }
    })
}

// 사용자를 추가하는 함수
const addUser = function(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);

    // UserModel 인스턴스 생성
    const user = new database.UserModel({'id': id, 'password': password, 'name': name});

    // save()로 저장
    user.save(function(err){
        if(err) {callback(err, null); return;}

        console.log('사용자 데이터 추가함');
        callback(null, user);

    });
}

module.exports.login = login;
module.exports.adduser = adduser;