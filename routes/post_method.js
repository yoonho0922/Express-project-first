const addpost = function(req, res){
    console.log('post_method 모듈 안에 있는 addpost 호출됨.');

    const paramTitle = req.body.title || req.query.title;
    const paramContents = req.body.contents || req.query.contents;
    const writer = req.user.id;

    console.log(`요청 파라미터 : ${paramTitle}, ${paramContents} 작성자 : ${writer}`);

    const database = req.app.get('database');

    if (database){
        // 1. 아이디를 사용해 사용자 검색
        database.UserModel.findById(writer, (err, results) => {
            if (err){
                console.log('게시판 글 추가 중 오류 발생 : ' + err.stack);
                return;
            }

            if(results == undefined || results.length < 1){
                console.dir(results)
                res.write('200',{'Content-Type' : 'text/html;charset=utf8'});
                res.write('<h2>사용자 [' + writer + ']를 찾을 수 없습니다.</h2>');
                res.end();
                return
            }

            const userObjectId = results[0]._id;
            console.log(`사용자 ObjectId : ${writer} -> ${userObjectId}`);

            // save()로 저장
            const post = new database.PostModel({
                title : paramTitle,
                contents : paramContents,
                writer : userObjectId
            });


            post.save((err) => {
                if(err) {throw err;}

                console.log('글 작성', '포스팅 글을 생성했습니다. : ' + post._id);
                return res.redirect('/showpost/' + post._id);
            });

        });
    } else{
        console.log('database를 가져올 수 없음!')
    }
};

const showpost = function(req, res){
    console.log('post_method 모듈 안에 있는 showpost 호출됨.');

    // URL 파라미터로 전달됨
    const paramId = req.body.id || req.query.id || req.params.id;
    console.log('요청 파라미터 : ' + paramId);

    const database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db){
        database.PostModel.load(paramId, function(err, result){
            if (err) {
                console.error('게시판 글 조회 중 오류 발생 : ' + err.stack);

                res.write('200',{'Content-Type' : 'text/html;charset=utf8'});
                res.write('<h2>게시판 글 조회 중 오류 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (result){
                console.log('글 가져옴, 제목 : ' + result.title);
                res.writeHead('200',{'Content-Type' : 'text/html;charset=utf8'});

                // 뷰 템플릿을 사용하여 렌더링한 후 전송
                const context = {
                    title : '글 조회',
                    post : result,
                };

                req.app.render('showpost', context, function(err, html) {
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

            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>글 조회  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}

const listpost = function(req, res) {
    console.log('post_method 모듈 안에 있는 listpost 호출됨');

    // var paramPage = req.body.page || req.query.page;
    // var paramPerPage = req.body.perPage || req.query.perPage;
    const paramPage = 0;
    const paramPerPage = 6;

    const database = req.app.get('database');

    if (database.db){

        const options = {
            page: paramPage,
            perPage: paramPerPage
        };

        database.PostModel.list(options, (err, result) => {
            if (err) {
                console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>게시판 글 목록 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (result){

                // 전체 문서 객체 수 확인
                database.PostModel.count().exec((err, count) => {
                    console.log('조회된 문서 객체 수 : ' + count);

                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

                    // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                    var context = {
                        title: '글 목록',
                        posts: result,
                        page: parseInt(paramPage),
                        pageCount: Math.ceil(count / paramPerPage),
                        perPage: paramPerPage,
                        totalRecords: count,
                        size: paramPerPage
                    };

                    req.app.render('listpost', context, function(err, html) {
                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                            res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                            res.write('<p>' + err.stack + '</p>');
                            res.end();

                            return;
                        }

                        res.end(html);
                    });

                });
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>글 목록 조회  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
}

module.exports.addpost = addpost;
module.exports.showpost = showpost;
module.exports.listpost = listpost;