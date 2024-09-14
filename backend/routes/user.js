const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User, Account } = require("../db");
const JWT_SECRET = require("../config");
const authMiddleware = require("../middleware");

const router = express.Router();

const signUpBody = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
router.post("/signin", async function (req, res) {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid username or password",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
  });

  // const response = await bcrypt.compare(req.body.password, user.password_hash);
  // console.log(response);
  if (!user) {
    return res.status(411).json({
      message: "No user exists with the give username",
    });
  }

  bcrypt.compare(
    req.body.password,
    user.password_hash,
    function (err, isValid) {
      if (isValid) {
        const token = jwt.sign(
          {
            userId: user._id,
          },
          JWT_SECRET
        );
        res.json({
          message: "User signed in successfully",
          token: token,
        });
      } else {
        return res.status(400).json({
          message: "Invalid password, please forget password and try again",
        });
      }
    }
  );
});

//-----------------------------------------------------------

router.post("/signup", async function (req, res) {
  const userDetails = req.body;
  const { success } = signUpBody.safeParse(userDetails);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }
  const existingUser = await User.findOne({
    username: userDetails.username,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken",
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await User.create({
    username: userDetails.username,
    firstname: userDetails.firstname,
    lastname: userDetails.lastname,
    password_hash: hashedPassword,
  });
  const userId = newUser._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  // res.cookie("token", token, {
  //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  //   httpOnly: true,
  // });
  res.status(201).json({
    message: "User created successfully",
    token: token,
  });
});

//-----------------------------------------------------------

const updateBody = zod.object({
  password: zod.string().optional(),
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
});

// Route to update the name, password or email //////////////////////////////////
router.put("/update", authMiddleware, async function (req, res) {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }

  await User.updateOne(
    {
      _id: req.userId,
    },
    req.body
  );

  res.json({
    message: "Information Updated successfully",
  });
});

// Route to find the user based on first name or last name //////////////////////////////////
router.get("/bulk", async function (req, res) {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [
      {
        firstname: {
          $regex: filter,
        },
      },
      {
        lastname: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id,
    })),
  });
});

router.get("/me", async (req, res) => {
  const token = req.body.token;
  if (!token) {
    res.status(404).send({
      message: "No token provided",
    });
  }

  const { userId } = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(userId);

  res.json({
    user: {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id,
    },
  })
});
module.exports = router;
