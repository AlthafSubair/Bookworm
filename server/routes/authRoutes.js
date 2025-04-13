import express from 'express';
import User from '../models/userSchema.js';
import generateToken from '../lib/generateToken.js';

const router = express.Router();

router.post('/login', async(req, res) => {
  try {

    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if(!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if(!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token for user
    const token = generateToken(user._id);

    return res.status(200).json({ message: 'User logged in successfully', token, user: { id: user._id, username: user.username, email: user.email, profileImage: user.profileImage } });
    
  } catch (error) {
    console.error('Error in login route:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
})

router.post('/register', async(req, res) => {
    try {

        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Check if username taken or not

        const userName = await User.findOne({ username });

        if(userName) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Check if user already exists
        const userEmail = await User.findOne({ email });
        if(userEmail) {
            return res.status(400).json({ message: 'User already exists, please login' });
        }

        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`


        // Create new user
        const newUser = new User({ username, email, password, profileImage });

        // Save user to database
        await newUser.save();

        // Generate token for user
        const token = generateToken(newUser._id);

        return res.status(201).json({ message: 'User registered successfully', token, user: { id: newUser._id, username: newUser.username, email: newUser.email, profileImage: newUser.profileImage } });

        
    } catch (error) {
        console.error('Error in register route:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
  })

export default router;