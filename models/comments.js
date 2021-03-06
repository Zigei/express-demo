const marked = require('marked');
const Comment =require('../lib/mongo').Comment;

Comment.plugin('contentToHtml',{
    afterFind: (comments) => {
        return comments.map((comment) => {
            comment.content = marked(comment.content);
            return comment;
        })
    }
})

module.exports = {
    create: (comment) => {
        return Comment.create(comment).exec();
    },
    delCommentById: (commentId ,author) => {
        return Comment.remove({ author: author, _id: commentId }).exec();
    },
    delCommentByPostId: (postId) => {
        return Comment.remove({ postId: postId }).exec();
    },
    getComments: (postId) => {
        return Comment
            .find({ postId: postId })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: 1 })
            .addCreatedAt()
            .contentToHtml()
            .exec();
    },
    getCommentsCount: (postId) => {
        return Comment.count({ postId: postId }).exec();
    }
}