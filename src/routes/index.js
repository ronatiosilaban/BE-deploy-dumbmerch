
const express = require('express')

const router = express.Router()


const { addUsers, getUser, getUsers, updateUser, deleteUser } = require('../controllers/user');
const { register, login, checkAuth } = require('../controllers/auth');
const { addProduct, getProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/product')
const { addProfile, getProfiles, getProfile, updateProfile, deleteProfile } = require('../controllers/profile');
const { addCategory, getCategories, getCategory, updateCategory, deleteCategory } = require('../controllers/category');
const { getTransactions, addTransaction, getTransaction, updateTransaction, deleteTransaction, notification } = require('../controllers/transaction')

const { auth } = require("../middlewares/auth")
const { uploadFile } = require('../middlewares/upload-file')

router.post('/user', addUsers)
router.get('/user', getUsers)
router.get('/users/:id', getUser)
router.patch('/user/:id', updateUser)
router.delete('/user/:id', deleteUser)

router.post('/register', register)
router.post('/login', login)
router.get("/check-auth", auth, checkAuth)

router.post('/products', auth, uploadFile("image"), addProduct)
router.get('/products', auth, getProduct)
router.get('/product/:id', auth, getProducts)
router.patch('/product/:id', auth, uploadFile("image"), updateProduct)
router.delete('/product/:id', auth, deleteProduct)

router.post('/profile', auth, addProfile)
router.get('/profile', auth, getProfiles)
router.get('/profile/:id', auth, getProfile)
router.patch('/profile/:id', auth, updateProfile)
router.delete('/profile/:id', auth, deleteProfile)

router.post('/category', auth, addCategory)
router.get('/categories', auth, getCategories)
router.get('/category/:id', auth, getCategory)
router.patch('/category/:id', auth, updateCategory)
router.delete('/category/:id', auth, deleteCategory)

router.post('/transaction', auth, addTransaction)
router.get('/transactions', auth, getTransactions)
// router.get('/transaction/:id', auth, getTransaction)
// router.patch('/transaction/:id', auth, updateTransaction)
// router.delete('/transaction/:id', auth, deleteTransaction)
router.post("/notification", notification)

module.exports = router