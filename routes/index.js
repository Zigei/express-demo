module.exports = (app) => {
	app.get('/', function (req, res) {
		res.redirect('/posts');
	});
	app.use('/sign', require('./sign'));
	app.use('/posts', require('./posts'));
	// 404 page
	app.use(function (req, res) {
		if (!res.headersSent) {
			res.status(404).render('404');
		}
	});
}