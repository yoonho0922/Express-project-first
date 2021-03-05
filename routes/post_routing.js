module.exports = function(router){
    console.log('post_routing 호출됨');

    router.route('/addpost').get(function(req, res){
        console.log('/addpost 패스 요청됨');
        res.render('addpost.ejs');
    });
};
