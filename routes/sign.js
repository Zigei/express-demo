var express = require('express');
var r = express.Router();
var sha1 = require('sha1');

var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;
var checkLogin = require('../middlewares/check').checkLogin;

// GET /signin 登录页
r.get('/in', checkNotLogin, (req, res, next) => {
	res.render("signin");
});

// POST /signin 用户登录
r.post('/in', checkNotLogin, (req, res, next) => {
	var name = req.fields.name;
	var psd = req.fields.password;
	UserModel.getUserByName(name)
		.then((user) => {
			if(!user){
				req.flash('error','用户错误');
				return res.redirect('back');
			}
			if(user.password !== sha1(psd)){
				req.flash('error','密码错误');
				return res.redirect('back');
			}
			req.flash("success","登录成功");
			delete user.password;
			req.session.user = user;
			res.redirect('/posts');
		}).catch(next);
});

// GET /signout 登出
r.get('/out', checkLogin, (req, res, next) => {
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/posts');
});

// GET /signup 注册页
r.get('/up', checkNotLogin, (req, res, next) => {
	res.render('signup');
});

// POST /signup 注册页
r.post('/up',checkNotLogin, (req,res,next) => {
	let result = UserModel.checkUserData(req);
	if(typeof(result) === "string"){
		// 注册失败，异步删除上传的头像
		fs.unlink(req.files.avatar.path);
		req.flash('error', result);
		return res.redirect('/sign/up');
	}
	let user = result;
	UserModel.create(user)
		.then((result) => {
			user = result.ops[0];
			delete user.password;
			req.session.user = user;
			req.flash('success', '注册成功');
			res.redirect('/posts');
		}).catch((e) => {
			us.unlink(req.files.avatar.path);
			if (e.message.match('e11000 duplicate key')) {
				req.flash('error', '用户名已被占用');
				return res.redirect('/sign/up');
			}
			next(e);
		})
})

module.exports = r;