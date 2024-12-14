const { Router } = require("express");
const {JWT_SECRET} = require ("../config.js");
const jwt = require('jsonwebtoken')
const {User,Account, Payment, Notification} = require('../db.js')
const z = require('zod')
const {AuthMiddleWare }= require('../middleware.js')

const signupBody = z.object({
    username: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	password: z.string()
 })
 const signinBody = z.object({
    username: z.string().email(),
	password: z.string()
 })
 const updateBody = z.object({
    firstName: z.string().optional(),
	lastName: z.string().optional(),
	password: z.string().optional()
 })

const paymentBody = z.object({
    amount: z.number().positive()
});

const router = Router()
router.post('/signup',async(req,res)=>{
   
   try {
    const signupData = req.body
    const {success} =  signupBody.safeParse(signupData)
    if(!success){
       return res.status(411).json({
      message: "Email already taken / Incorrect inputs"
        })
     }
      const user = await User.findOne({
         username : signupData.username
      })
      if(user){
        return  res.status(411).json({
              message: "Email already taken / Incorrect inputs"
          })
      }
     const userData = await User.create({
          username : signupData.username,
          firstName : signupData.firstName,
          lastName : signupData.lastName,
          password  : signupData.password
      })
      const userId = userData._id
      const AccountData = await Account.create({
          userId,
          balance : 1 + Math.random() * 300000
      })
      const token =  jwt.sign({id : userId},JWT_SECRET)
     return res.status(200).json(
          {
              message: "User created successfully",
              token: token
          }
      )
    
   } catch (error) {
     return res.status(400).json({
        Error : error.message
      })
   }
  
})
router.post ('/signin',async(req,res)=>{
    const signinData = req.body
    const {success} =  signinBody.safeParse(signinData)
   if(!success){
      res.status(411).json({
	      message: "Incorrect inputs"
      })
   }
    const user = await User.findOne({
        username : signinData.username,
        password : signinData.password
     })
    if(user){
        const token = jwt.sign({id : user._id},JWT_SECRET)
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})
router.put('/',AuthMiddleWare,(req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    const updateData = req.body
    const user = User.findById(updateData.userId)
    if(!user){
        res.status(411).json({
            message : "user-id is not found"
        })
    }
    User.updatOne({_id : req.userId},req.body)
    res.status(200).json({
        message: "Error while updating information"
    })

})
router.get('/bulk',async(req,res)=>{
   const filter = req.query.filter || ""
   const users =await User.find({
   $or : [{
    firstName :{
        "$regex" :filter
    }
   },
    {
      lastName :{
        "$regex" :filter
       }
    }]
   })
   res.json({
    user: users.map(user => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id
    }))
})
   
})
router.get('/profile', AuthMiddleWare, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user profile"
        });
    }
});
router.post('/payment', AuthMiddleWare, async (req, res) => {
    try {
        const { success } = paymentBody.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                message: "Invalid payment amount"
            });
        }

        const payment = await Payment.create({
            userId: req.userId,
            amount: req.body.amount
        });

        res.json({
            message: "Payment request created successfully",
            paymentId: payment._id
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating payment request"
        });
    }
});
router.get('/payments', AuthMiddleWare, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.userId });
        res.json({ payments });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching payments"
        });
    }
});
router.get('/notifications', AuthMiddleWare, async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Find all active and scheduled notifications that haven't expired
        const notifications = await Notification.find({
            $and: [
                // Only show Active or Scheduled notifications
                { status: { $in: ['Active', 'Scheduled'] } },
                // Only show notifications that are scheduled for now or earlier
                { scheduledFor: { $lte: currentDate } },
                // Only show notifications that haven't expired
                { expiresAt: { $gt: currentDate } }
            ]
        })
        .sort({ scheduledFor: -1 }) // Show newest first
        .populate('createdBy', 'firstName lastName');

        res.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message
        });
    }
});



module.exports = router;

