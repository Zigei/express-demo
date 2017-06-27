var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var r = express.Router();

const UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
r.get('/', checkNotLogin, (req, res, next) => {
	res.render('signup');
});

// POST /signup 用户注册
r.post('/', checkNotLogin, (req, res, next) => {
	let name = req.fields.name;
	let gender = req.fields.gender;
	let bio = req.fields.bio;
	let avatar = req.files.avatar.path.split(path.sep).pop();
	let password = req.fields.password;
	let repassword = req.fields.repassword;
	var errorMsg = "";
	if (!(name.length >= 1 && name.length <= 10)) {
		errorMsg = '名字请限制在 1-10 个字符';
	}
	if (['m', 'f', 'x'].indexOf(gender) === -1) {
		errorMsg = '性别只能是 m、f 或 x';
	}
	if (!(bio.length >= 1 && bio.length <= 30)) {
		errorMsg = '个人简介请限制在 1-30 个字符';
	}
	if (!req.files.avatar.name) {
		errorMsg = '缺少头像';
	}
	if (password.length < 6) {
		errorMsg = '密码至少 6 个字符';
	}
	if (password !== repassword) {
		errorMsg = '两次输入密码不一致';
	}
	if(errorMsg !== ""){
		// 注册失败，异步删除上传的头像
		fs.unlink(req.files.avatar.path);
		req.flash('error', errorMsg);
		return res.redirect('/signup');
	}

	password = sha1(password);
	var user = {
		name: name,
		password: password,
		gender: gender,
		bio: bio,
		avatar: avatar
	};
	console.log(user);
	UserModel.create(user).then((result) => {
		user = result.ops[0];
		delete user.password;
		req.session.user = user;
		req.flash('success', '注册成功');
		res.redirect('/posts');
	}).catch((e) => {
		fs.unlink(req.files.avatar.path);
		if (e.message.match('e11000 duplicate key')) {
			req.flash('error', '用户名已被占用');
			return res.redirect('/signup');
		}
		next(e);
	})
});

module.exports = r;