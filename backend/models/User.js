const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.pre('save',async function(next){
    if(this.isModified('password'))
    {
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
})
module.exports = mongoose.model('User', userSchema);