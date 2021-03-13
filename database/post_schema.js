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

        removePost: function(id, callback){
            this.remove({ _id: id }, (err) => {
                if (err) throw err;

                console.log('remove posts _id : ' + id);
            });
        },

        // ID로 글 찾기
        load: function(id, callback){
            this.findOne({_id: id})
                .populate('writer')
                .exec(callback);
        },

        list: function(options, callback) {
            var criteria = options.criteria || {};

            this.find(criteria)
                .populate('writer', 'name provider email')
                .sort({'created_at': -1})
                .exec(callback);
        }
    }

    console.log('PostSchema 정의함');

    return PostSchema;
};

module.exports = Schema;