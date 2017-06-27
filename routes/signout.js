const express = require('express');
const r = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
r.get('/', checkLogin, (req, res, next) => {
	req.session.user = null;
	req.flash('success','登录成功');
	res.redirect('/posts');
});

module.exports = r;