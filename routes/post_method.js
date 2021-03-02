const addpost = function(req, res){
    console.log('post_method 모듈 안에 있는 addpost 호출됨.');

    const paramTitle = req.body.title || req.query.title;
    const paramContents = req.body.contents || req.query.contents;
    const paramWriter = req.body.writer || req.query.writer;

    console.log(`요청 파라미터 : ${paramTitle}, ${paramContents}, ${paramWriter}`);

    const database = req.app.get('database');

    if (database){
        // 1. 아이디를 사용해 사용자 검색
        database.UserModel.findById(paramWriter, (err, results) => {
            if (err){
                console.log('게시판 글 추가 중 오류 발생 : ' + err.stack);
                return;
            }

            if(results == undefined || results.length < 1){
                console.dir(results)
                res.write('200',{'Content-Type' : 'text/html;charset=utf8'});
                res.write('<h2>사용자 [' + paramWriter + ']를 찾을 수 없습니다.</h2>');
                res.end();
                return
            }

            const userObjectId = results[0]._id;
            console.log(`사용자 ObjectId : ${paramWriter} -> ${userObjectId}`);

            // save()로 저장
            const post = new database.PostModel({
                title : paramTitle,
                contents : paramContents,
                writer : userObjectId
            });


            post.savePost((err, results) => {
                if(err) {throw err;}

                console.log('글 작성', '포스팅 글을 생성했습니다. : ' + post._id);
                return res.redirect('/public/addpost.html');
            });

        });
    } else{
        console.log('database를 가져올 수 없음!')
    }
};

module.exports.addpost = addpost;