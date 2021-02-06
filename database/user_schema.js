const crypto = require('crypto');

let Schema = {};

Schema.createSchema = function(mongoose) {

    // Schema 정의
    const UserSchema = mongoose.Schema({
        id: {type: String, required: true, 'default': ' '},
        hashed_password : {type: String, required: true, 'default' : ' '},
        salt : {type: String, required: true},
        name: {type: String, createIndex: 'hashed', 'default': ' '}
    });

    // static 메소드 - findById 메소드
    UserSchema.static('findById', function(id, callback){
        return this.find({id: id}, callback);
    });

    // static 메소드 - findAll 메소드
    UserSchema.static('findAll', function(callback){
        return this.find({ }, callback);
    })

    // instance 메소드 - 암호화 메소드
    UserSchema.method('encryptPassword', function(plainText, inSalt){
        if(inSalt){
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else{
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    // instance 메소드 - salt 값 생성 메소드
    UserSchema.method('makeSalt', function(){
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    // instance 메소드 - 인증 메소드
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
        console.log('스키마의 authenticate 메소드 호출됨')
        if(inSalt){
            console.log('authenticate 호출됨 : %s -> %s : %s', plainText,
                this.encryptPassword(plainText, inSalt), hashed_password);
            return this.encryptPassword(plainText, inSalt) == hashed_password;
        } else{
            console.log('[%s] 아이디 slat 값이 없음!', this.id);
            return false;
        }
    });

    // 가상 메소드 - password
    UserSchema.virtual('password').set(function(password){
        this._password = password;
        this.salt  = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);

    }).get(function() {return this._password});

    console.log('Schema 정의함');

    return UserSchema;
};

module.exports = Schema;

