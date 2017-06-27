var express = require('express');
var r = express.Router();
var sha1 = require('sha1');

var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
r.get('/', checkNotLogin, (req, res, next) => {
	res.render('signin')
});

// POST /signin 用户登录
r.post('/', checkNotLogin, (req, res, next) => {
	var name = req.fields.name;
	var psd = req.fields.password;
	UserModel.getUserByName(name)
		.then((user) => {
			if(!user){
				req.flash('error','用户错误');
				return res.redirect('back');
			}
			if(sha1(psd) !== user.password){
				req.flash('error','用户密码错误');
				return  res.redirect('back');
			}
			req.flash('success', '登录成功');
			delete user.password;
			req.session.user = user;
			res.redirect('/posts');
		}).catch(next);
});

module.exports = r;