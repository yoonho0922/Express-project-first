module.exports = function(router, passport){
    console.log('user_passport 호출됨');

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
};