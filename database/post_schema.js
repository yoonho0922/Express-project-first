const Schema = {};

Schema.createSchema = function(mongoose){

    // 글 스키마 정의
    const PostSchema = mongoose.Schema({
        title: {type: String},
        contents: {type: String},
        // users 컬렉션에 문서 객체 중 ObjectId 속성 값이 저장됨
        writer: {type: mongoose.Schema.ObjectId, ref: 'users'},
        created_at: {type: Date, 'default': Date.now},
        updated_at: {type: Date, 'default': Date.now}
    });

    PostSchema.path('title').required(true, '글 제목을 입력하셔야 합니다.');
    PostSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다.');



    PostSchema.statics = {
        // ID로 글 찾기
        load: function(id, callback){
            this.findOne({_id: id})
                .populate('writer', 'name provider email')
                .exec(callback);
        }
    }

    console.log('PostSchema 정의함');

    return PostSchema;
};

module.exports = Schema;