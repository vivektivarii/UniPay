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

    role: { 
        type: String, 
        enum: ['user'], 
        default: 'user',
        immutable: true  // Cannot be changed once set
    }

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
        type: mongoose.Schema.Types.ObjectId,
        ref: function() {
            // Dynamically reference User or Admin based on the document
            return this.isAdminAccount ? 'Admin' : 'User';
        },
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    isAdminAccount: {
        type: Boolean,
        default: false
    }
});


const TransactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Reference to Admin model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
});

// Create indexes
accountSchema.index({ userId: 1 });
TransactionSchema.index({ sender: 1, status: 1 });
TransactionSchema.index({ receiver: 1, status: 1 });

const Transaction = mongoose.model('Transaction', TransactionSchema)
const User = mongoose.model('User',userSchema)
const Account = mongoose.model('Account',accountSchema)
const Admin = mongoose.model('Admin', AdminSchema)

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['Active', 'Scheduled', 'Expired'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    scheduledFor: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

NotificationSchema.index({ status: 1, scheduledFor: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {User,Account,Admin, Transaction, Notification }