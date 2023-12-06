//This module will be responsible for storing and retrieving user information (user & password) using our newly created MongoDB database
// modules/auth-service.js
require('dotenv').config();
//functionalities provided by the "bcryptjs" module(installed), such as hashing and comparing passwords securely.
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define userSchema
let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  loginHistory: [
    {
      dateTime: {
        type: Date,
        required: true,
      },
      userAgent: {
        type: String,
        required: true,
      },
    },
  ],
});

let User; // to be defined on new connection (see initialize)

// initialize function
function initialize() {
  return new Promise((resolve, reject) => {
    console.log(process.env.MONGODB);
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err) => {
      console.log(process.env.MONGODB);
      reject(err); // reject the promise with the provided error
    });

    db.once('open', () => {
      console.log(process.env.MONGODB);
      User = db.model('users', userSchema);
      resolve();
    });
  });
}
// registerUser function
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        // Validate if passwords match
        if (userData.password !== userData.password2) {
            reject(new Error('Passwords do not match'));
            return;
        }

        // Hash the user's password
        bcrypt.hash(userData.password, 10)
            .then((hash) => {
                // Replace the plain text password with the hashed version
                userData.password = hash;

                // Create a new user
                let newUser = new User(userData);

                // Save the new user to the database
                newUser.save()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        // Check for duplicate key (code 11000)
                        if (err.code === 11000) {
                            reject(new Error('User Name already taken'));
                        } else {
                            reject(new Error(`There was an error creating the user: ${err}`));
                        }
                    });
            })
            .catch((err) => {
                reject(new Error('There was an error encrypting the password'));
            });
    });
}

// checkUser function
function checkUser(userData) {
  return new Promise((resolve, reject) => {
      User.find({ userName: userData.userName }).exec()
          .then((users) => {
              if (users.length === 0) {
                  reject("Unable to find user: " + userData.userName);
              } 

              const hashedPassword = users[0].password;
              bcrypt.compare(userData.password, hashedPassword)
                  .then((passwordMatch) => {
                      if (!passwordMatch) {
                          reject(`Incorrect Password for user: ${userData.userName}`);
                      } else {
                          if (users[0].loginHistory.length === 8) {
                              users[0].loginHistory.pop();
                          }

                          users[0].loginHistory.unshift({
                              dateTime: (new Date()).toString(), userAgent: userData.userAgent
                          });

                          User.updateOne(
                              { userName: users[0].userName }, 
                              { $set: { loginHistory: users[0].loginHistory } }
                          ).exec()
                              .then(() => {
                                  resolve(users[0]);
                              })
                              .catch((updateErr) => {
                                  reject("Error updating login history: " + updateErr.message);
                              });
                      }
                  })
                  .catch((err) => {
                      reject("Error comparing passwords: " + err.message);
                  });
          })
          .catch((err) => {
              reject("Error finding user: " + err.message);
          });
  });
}
  
  module.exports = {
    initialize,
    registerUser,
    checkUser,
  };

