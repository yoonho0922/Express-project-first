
module.exports = {

    server_port : 3000,

    db_url : 'mongodb://localhost:27017/local',
    db_schemas: [
        {file:'./user_schema', collection:'users', schemaName: 'UserSchema', modelName: 'UserModel'},
        {file:'./post_schema', collection:'posts', schemaName: 'PostSchema', modelName: 'PostModel'},
    ],

    route_info: [
        {file:'./post_method', path:'/addpost', method:'addpost', type:'post'},
        {file:'./post_method', path:'/showpost/:id', method:'showpost', type:'get'},
        {file:'./post_method', path:'/listpost', method:'listpost', type:'post'},
        {file:'./post_method', path:'/listpost', method:'listpost', type:'get'},
        {file:'./post_method', path:'/removepost/:_id', method:'removepost', type:'get'}
    ]
}