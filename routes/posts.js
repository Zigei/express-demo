const express = require('express');
const r = express.Router();
const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
const checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页
r.get('/', (req, res, next) => {
	var author = req.query.author;
	PostModel.getPosts(author)
		.then((posts) => {
			res.render('posts', {
				posts: posts
			})
		}).catch(next);
})

// POST /posts 发表一篇文章
r.post('/', checkLogin, (req, res, next) => {
	var author = req.session.user._id;
	var title = req.fields.title;
	var content = req.fields.content;
	var error = "";
	if (!title.length)
		error = "请填写标题";
	if (!content.length)
		error = "请填写内容";

	console.log(req.fields);
	if (error !== "") {
		req.flash('error', error);
		return res.redirect('back');
	}

	let post = {
		author: author,
		title: title,
		content: content,
		pv: 0
	}
	console.log(post);
	PostModel.create(post)
		.then((result) => {
			console.log(result.ops[0])
			post = result.ops[0];
			req.flash('success', '发表成功');
			res.redirect(`/posts/${post._id}`);
		}).catch(next);
})

// GET /posts/create 发表文章页
r.get('/create', checkLogin, (req, res, next) => {
	res.render('create');
});

// GET /posts/:postId 单独一篇的文章页
r.get('/:postId', (req, res, next) => {
	var postId = req.params.postId;
	Promise.all([
		PostModel.getpostById(postId),
		CommentModel.getComments(postId),
		PostModel.incPv(postId)
	]).then((result) => {
		var post = result[0];
		var comments = result[1];
		console.log(result)
		if (!post) {
			throw new Error('该文章不存在');
		}
		res.render('post', {
			post: post,
			comments:comments
		});
	}).catch(next);
})

// GET /posts/:postId/edit 更新文章页
r.get('/:postId/edit', checkLogin, (req, res, next) => {
	var postId = req.params.postId;
	var author = req.session.user._id;

	PostModel.getRawPostById(postId)
		.then((post) => {
			if (!post) {
				throw new Error('该文章不存在');
			}
			if (author.toString() !== post.author._id.toString()) {
				throw new Error('权限不足');		
			}
			res.render('edit', {
				post: post
			});
		}).catch(next);
})


// POST /posts/:postId/edit 更新一篇文章
r.post('/:postId/edit', checkLogin, (req, res, next) => {
	var postId = req.params.postId;
	var author = req.session.user._id;
	var title = req.fields.title;
	var content = req.fields.content;
	PostModel.updatePostById(postId, author, {
		title: title,
		content: content
	}).then(() => {
		req.flash('success','编辑成功');
		res.redirect(`/posts/${postId}`);
	}).catch(next);
})

// GET /posts/:postId/remove 删除一篇文章
r.get('/:postId/remove', checkLogin, (req, res, next) => {
	var postId = req.params.postId;
	var author = req.session.user._id;
	PostModel.delPostById(postId, author)
		.then(() => {
			req.flash('success',"删除成功");
			res.redirect('/posts');
		}).catch(next);
})

// POST /posts/:postId/comment 创建一条留言
r.post('/:postId/comment', checkLogin, (req, res, next) => {
	var author = req.session.user._id;
	var postId = req.params.postId;
	var content = req.fields.content;
	var comment = {
		author: author,
		postId: postId,
		content: content
	};

	CommentModel.create(comment)
		.then(() => {
			req.flash("success","留言成功");
			res.redirect('back');
		}).catch(next);
})

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
r.get('/:postId/comment/:commentId/remove', checkLogin, (req, res, next) => {
	var author = req.session.user._id;
	var commentId = req.params.commentId;
	CommentModel.delCommentById(commentId,author)
		.then(() => {
			req.flash('success',"删除成功");
			res.redirect('back');
		}).catch(next);
})

module.exports = r;