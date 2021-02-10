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


//==== 패스포트 관련 ====//

const passport = require('passport');
const flash = require('connect-flash');

app.use(passport.initialize())
app.use(passport.session());
app.use(flash());

const LocalStrategy = require('passport-local').Strategy;

// 패스포트 로그인 설정
passport.use('local-login', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, id, password, done){
    console.log('passport의 local-login 호출됨 : ' + id + ', ' + password);

    const db = app.get('database');

    db.UserModel.findOne({'id': id}, function(err, user){
        if(err) {return done(err);}

        // 등록된 사용자가 없는 경우
        if(!user){
            console.log('일치하는 계정 없음');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        }

        // 비밀번호가 일치하지 않는 경우
        const authenticated = user.authenticate(password, user.salt, user.hashed_password);

        if(!authenticated){
            console.log('비밀번호 일치하지 않음');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }

        // 정상인 경우
        console.log('계정과 비밀번호가 일치함');
        return done(null, user);
    });
}));

// 패스포트 회원가입 설정
passport.use('local-signup', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, id, password, done){
    // 요청 파라미터 중 name 파라미터 확인
    const paramName = req.body.name;
    console.log('passport의 local-signup 호출됨 : ' + id + ', ' + password + ', ' + paramName);

    const db = app.get('database');
    db.UserModel.findOne({'id':  id}, function(err, user) {
        // 에러 발생 시
        if (err) {return done(err);}

        // 기존에 사용자 정보가 있는 경우
        if (user) {
            console.log('기존에 계정이 있음.');
            return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
        } else {
            // 모델 인스턴스 객체 만들어 저장
            var user = new db.UserModel({'id':id, 'password':password, 'name':paramName});
            user.save(function(err) {
                if (err) {throw err;}

                console.log("사용자 데이터 추가함.");
                return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
            });
        }
    });
}));

// 사용자 인증에 성공했을 때 호출
passport.serializeUser(function(user, done){
    console.log('serializeUser 호출됨');
    done(null, user);
});

// 사용자 인증 이후 사용자 요청이 있을 때마다 호출
passport.deserializeUser(function(user, done){
    console.log('deserializeUser 호출됨');
    done(null, user);
});

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
    console.log('/ 패스 요청됨');
    res.render('index.ejs');
});

router.route('/login').get(function(req, res){
    console.log('/login 패스 요청됨');
    res.render('login.ejs', {message: req.flash('loginMessage')});
});

router.route('/login').post(passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}));

router.route('/logout').get(function(req, res) {
    console.log('/logout 패스 요청됨.');
    req.logout();
    res.redirect('/');
});

router.route('/signup').get(function(req, res) {
    console.log('/signup 패스 요청됨');
    res.render('signup.ejs', {message: req.flash('signupMessage')});
});

router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
}));

router.route('/profile').get(function(req, res) {
    console.log('/profile 패스 요청됨.');

    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
        return;
    }

    // 인증된 경우
    console.log('사용자 인증된 상태임.');
    if (Array.isArray(req.user)) {
        res.render('profile.ejs', {user: req.user[0]});
    } else {
        res.render('profile.ejs', {user: req.user});
    }
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