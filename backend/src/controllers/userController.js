import User from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { meeting as Meeting } from "../models/meetings.model.js";
// login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "please provide username and password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "invalid credentials" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    res.status(httpStatus.OK).json({ token });
  } catch (e) {
    res.status(500).json({ message: `something went wrong ${e}` });
  }
};

// register
const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "please provide name, username and password" });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(httpStatus.CONFLICT).json({ message: "user already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      username,
      password: hashPassword,
    });

    res.status(httpStatus.CREATED).json({ message: "user registered" });
  } catch (e) {
    res.status(500).json({ message: `something went wrong ${e}` });
  }
};



const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meeting_code: meeting_code 
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


export { login, register, getUserHistory, addToHistory }