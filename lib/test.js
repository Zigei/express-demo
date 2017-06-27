const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:String,
    author:String,
    body:String,
    comments:[{body:String,date:Date}],
    date:{type:Date,default:Date.now},
    hidden:Bloolean,
    meta:{
        votes:Number,
        favs:Number
    }
});

exports.Blog = mongoose.model('Blog',blogSchema);

let PersonSchema = new Schema({
    name: {
        type:"String",
        required:true,
    }, 
    age:{
        type:'Number',
        min:0,
        max:255
    },
    sex:{
        type:'String',
        enum:['男',女]
    },
    orther:{
        type:"String",
        validate:[validate,err]
    }
});
// 查询类似数据   少数
PersonSchema.methods.findSimilayTypes = (callback) => {
    return this.model('Person').find({type:this.type},callback);
}

PersonSchema.statics.findByName = (name,cb) => {
    this.find({name:new RegExp(name,'i'),cb})
}



const PersonModel = mongoose.model("Person",PersonSchema);
// demo
let krouky = new PersonSchema({name:'krouky',type:"前端工程师"});
krouky.findSimilayTypes((err,persons) => {
    console.log(persons);
})

PersonModel.findByName('krouky',(err,persons) => {
    //找到所有名字叫krouky的人
})


let TankSchmea = new Schema({
    name:"String",
    size:"String"
});

let TankModel = mongoose.model('Tank',TankSchmea);
let tank = {name:'something',size:'small'};
TankModel.create(tank);
var tankEntity = new TankModel('someother','size:big');
tankEntity.save();