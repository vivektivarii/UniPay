const {mongoose,Schema,model} = require( 'mongoose')
const zod = require('zod');
mongoose.connect('mongodb+srv://admin:dnXjLRdeL0K3KL4R@cluster0.zxrddre.mongodb.net/paytm').then(() => console.log('Connected!'));
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },

    role: { type: String, enum: ['user', 'admin'], default: 'user', immutable: true }
});

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    
    role: { 
        type: String, 
        enum: ['admin'], 
        default: 'admin',
        immutable: true  // Cannot be changed once set
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});



const Payment = require('./db/Payment');
const User = mongoose.model('User',userSchema)
const Account = mongoose.model('Account',accountSchema)
const Admin = mongoose.model('Admin', AdminSchema)
module.exports = {User,Account,Admin }