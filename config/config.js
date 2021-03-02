
module.exports = {

    server_port : 3000,

    db_url : 'mongodb://localhost:27017/local',
    db_schemas: [
        {file:'./user_schema', collection:'users', schemaName: 'UserSchema', modelName: 'UserModel'},
        {file:'./post_schema', collection:'posts', schemaName: 'PostSchema', modelName: 'PostModel'}
    ],

    route_info: [
        {file:'./user_method', path:'/process/login', method:'login', type:'post'},
        {file:'./user_method', path:'/process/adduser', method:'adduser', type:'post'},
        {file:'./post_method', path:'/process/addpost', method:'addpost', type:'post'}
    ]
}