const marked = require('marked');
const Post = require('../lib/mongo').Post;
const CommentModel = require('./comments');

Post.plugin('contentToHtml',{
    afterFind: (posts) => {
        return  posts.map((post) => {
            post.content = marked(post.content);
            return post;
        })
    },
    afterFindOne: (post) => {
        if(post){
            post.content = marked(post.content);
        }
        return post;
    }
})

Post.plugin('addCommentsCount',{
    afterFind: (posts) => {
        return Promise.all(posts.map((post) => {
            return CommentModel.getCommentsCount(post._id).then((commentsCount) => {
                post.commentsCount = commentsCount;
                return post;
            })
        }))
    },
    afterFindOne : (post) => {
        if(post){
            return CommentModel.getCommentsCount(post._id).then((count) => {
                post.commentsCount = count;
                return post;
            })
        }
        return post;
    }
})

module.exports = {
    create: (post) => {
        return Post.create(post).exec();
    },
    getpostById: (postId) => {
        return Post
            .findOne({ _id:postId })
            .populate({ path: 'author' , model: 'User'})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },
    getPosts: (author) => {
        var query = {};
        if(author){
            query.author = author;
        }
        return Post
            .find(query)
            .populate({ path: 'author', model: 'User'})
            .sort({ _id: -1 })
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },
    getRawPostById: (postId) => {
        return Post
            .findOne({ _id: postId})
            .populate({ path: 'author', model: 'User'})
            .exec();
    },
    updatePostById: (postId,author,data) => {
        return Post.update({ author: author, _id: postId }, { $set: data }).exec();
    },
    delPostById: (postId, author) => {
        return Post.remove({ author: author, _id: postId})
            .exec()
            .then((res) => {
                if(res.result.ok && res.result.n >0){
                    return CommentModel.delCommentByPostId(postId);
                }
            });
    },
    incPv: (postId) => {
        return Post.update({ _id: postId }, { $inc: { pv : 1 } }).exec();
    }
};