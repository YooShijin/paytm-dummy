const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
dbURL = "mongodb+srv://asmit0:OkayGoogle@cluster0.qv1o2xw.mongodb.net/PayTM";

mongoose.connect(dbURL);

const schema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true, maxLength: 50 },
  lastname: { type: String, required: true, trim: true, maxLength: 50 },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password_hash: { type: String, required: true, minLength: 6 },
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: { type: Number, required: true },
});

/////////////////////// Taken from MojoAuth hashing-password-in-node.js////////////////////////////////

// Method to generate a hash from plain text
// schema.methods.createHash = async function (plainTextPassword) {
//   // Hashing user's salt and password with 10 iterations,
//   const saltRounds = 11;

//   // First method to generate a salt and then create hash
//   const salt = await bcrypt.genSalt(saltRounds);
//   return await bcrypt.hash(plainTextPassword, salt);

//   // Second mehtod - Or we can create salt and hash in a single method also
//   // return await bcrypt.hash(plainTextPassword, saltRounds);
// };

// // Validating the candidate password with stored hash and hash function
// schema.methods.validatePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password_hash);
// };
const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", schema);

module.exports = { User, Account };
