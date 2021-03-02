const Schema = {};

Schema.createSchema = function(mongoose){

    // 글 스키마 정의
    const PostSchema = mongoose.Schema({
        title: {type: String},
        contents: {type: String},
        // users 컬렉션에 문서 객체 중 ObjectId 속성 값이 저장됨
        writer: {type: mongoose.Schema.ObjectId, ref: 'users'},
        comments: [{
            contents: {type: String},
            writer: {type: mongoose.Schema.ObjectId, ref: 'users'},
            created_at: {type: Date, 'default': Date.now}
        }],
        tags: {type: [], 'default': ''},
        created_at: {type: Date, 'default': Date.now},
        updated_at: {type: Date, 'default': Date.now}
    });

    PostSchema.path('title').required(true, '글 제목을 입력하셔야 합니다.');
    PostSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다.');

    PostSchema.methods = {
        // 글 저장
        savePost: function(callback) {
            this.save(callback);
        }
    };

    console.log('PostSchema 정의함');

    return PostSchema;
};

module.exports = Schema;