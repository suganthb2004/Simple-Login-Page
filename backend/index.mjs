// index.mjs

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';


const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename)
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://suganth:9789625779@cluster0.qt4i9vq.mongodb.net/app?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define MongoDB schemas and models
const profileSchema = new mongoose.Schema({
  clientName: String,
  email: String,
  income: Number,
  workSpecification: String,
});

const Profile = mongoose.model('Profile', profileSchema);

const expenseSchema = new mongoose.Schema({
  name: String,
  amountSpent: Number,
  image: String,
});

const Expense = mongoose.model('Expense', expenseSchema);

const loginSchema = new mongoose.Schema({
  email : String,
  password : String,
});

const Login = mongoose.model('Login',loginSchema);

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await SignUp.findOne({ email, password });
    if (existingUser) {
      const newLogin = new Login({ email, password });
      await newLogin.save();
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Login failed'); // Use 401 for unauthorized access
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/api/saveData', async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const existingUser = await SignUp.findOne({ email });
//     if (existingUser) {
//       res.status(409).send('User already exists'); // Use 409 for conflict
//     } else {
//       // Hash the password before saving it
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const newUser = new SignUp({ username, email, password: hashedPassword });
//       await newUser.save();
//       res.status(201).send('Signed-Up successfully');
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


const signupSchema = new mongoose.Schema({
  username : String,
  email : String,
  password : String,
});

const SignUp = mongoose.model('SignUp',signupSchema);

app.post('/api/saveData',async(req,res)=>{
  const { username, email, password } = req.body;
  try {
    await SignUp.updateOne({}, { username, email, password }, { upsert: true });
    res.status(201).send('Signed-Up successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/getProfileData', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to save profile data
app.post('/api/saveProfile', async (req, res) => {
  const data = req.body;
  try {
    await Profile.findOneAndUpdate({}, data, { upsert: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to get expenses data
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to reset expenses data
app.post('/api/resetExpenses', async (req, res) => {
  try {
    await Expense.deleteMany();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to reset amountSpent for all expenses
app.post('/api/resetAmountSpent', async (req, res) => {
  try {
    await Expense.updateMany({}, { $set: { amountSpent: 0 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to update expense
app.post('/api/updateExpense', async (req, res) => {
  const { category, amountSpent } = req.body;

  try {
    await Expense.findOneAndUpdate({ name: category }, { amountSpent });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
