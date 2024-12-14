const { Router } = require("express");
const userRouter = require('./user.js');
const accountRouter = require('./account.js');
const adminRouter = require('./admin.js');



const router = Router();

router.use('/user', userRouter);
router.use('/account', accountRouter);
router.use('/admin', adminRouter);

module.exports = router;
