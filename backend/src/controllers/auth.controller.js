import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    if (!email || !password || !fullName) {
      res.status(400).send({ message: "Please provide all fields" });
    }
    // hash password
    if (password.length < 6) {
      res.status(400).send({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findOne({ email, password, fullName });
    if (user) {
      res.status(400).send({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword, fullName });
    if (newUser) {
      // todo generate jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    }
  } catch (error) {
    console.log("Error in signup controller " + error);
    res.status(400).send({ message: "Error in signup controller " });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({ message: "email not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).send({ message: "password not valid" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller " + error);
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout controller " + error);
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    // protectRoute(req, res); req has user
    const userId = req.user._id;
    if (!profilePic) {
      res.status(400).send({ message: "Please provide profile pic" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });
    res.status(200).json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.log("Error in updateProfile internal controller " + error);
  }
};
export const checkAuth = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    
    console.log("Error in checkAuth internal controller " + error); 
  }
}