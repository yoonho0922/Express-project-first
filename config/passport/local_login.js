const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, id, password, done){
    console.log('passport의 local-login 호출됨 : ' + id + ', ' + password);

    const db = req.app.get('database');

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
})
