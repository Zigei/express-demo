const User = require('../lib/mongo').User;

module.exports = {
    create: (user) => {
        return User.create(user).exec();
    },
    getUserByName:(name) => {
        return User
            .findOne({ name: name })
            .addCreatedAt()
            .exec();
    },
    checkUserData: (req) => {
        let name = req.fields.name;
        let avator = req.files.avatar.path.split(path.sep).pop();
        let gender = req.fields.gender;
        let bio = req.fields.bio;
        let password = req.fields.password;
        let repassword = req.fields.repassword;
        let errorMsg = "";
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
            return errorMsg;
        }
        password = sha1(password);
        return  {
            name: name,
            gender:gender,
            avatar:avator,
            bio:bio,
            password:password
        }
    }
}