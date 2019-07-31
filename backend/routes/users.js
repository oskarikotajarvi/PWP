/**
 * @file users.js
 * @description Contains routes for user functionality
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

//Login page
router.get('/login', (req, res) => {
    res.send('Login');
});

//Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
    })(req, res, next);
});

//Register page
router.get('/register', (req, res) => {
    res.send('Register');
});

//Register handle
router.post('/register', (req, res) => {
    const {firstName, lastName, email, password, password2, email2} = req.body;
    const errors = [];
    if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !password2 ||
        !email2
    ) {
        res.status(500).send({
            error:
                'Missing parameters, please fill out all the required fields',
        });
    } else {
        if (!email.includes('@')) {
            errors.push({
                error: 'Not a valid email!',
                validationError: true,
            });
        }
        if (email !== email2) {
            errors.push({
                error: "Emails don't match!",
                validationError: true,
            });
        }
        if (password !== password2) {
            errors.push({
                error: "Passwords don't match!",
                validationError: true,
            });
        }
        if (password.length < 6) {
            errors.push({
                error: 'Password needs to be 6 characters or more!',
                validationError: true,
            });
        }

        if (errors.length !== 0) {
            res.status(400).send({errors: errors, validationError: true});
        } else {
            User.findOne({email: email}).then(user => {
                if (user === null) {
                    const hash = bcrypt.hashSync(password, 13);
                    const newUser = new User({
                        firstName: firstName,
                        lastName: lastName,
                        email: email.toLowerCase(),
                        password: hash,
                        days: [],
                    });
                    newUser
                        .save()
                        .then(() => {
                            res.status(200).send({msg: 'registered'});
                        })
                        .catch(err => {
                            if (
                                err.type === 'MongoError' &&
                                err.code === 11000
                            ) {
                                errors.push({
                                    error:
                                        'User already registered with this email!',
                                    validationError: true,
                                });
                                res.status(400).send({
                                    errors: errors,
                                });
                            } else {
                                errors = [];
                                errors.push({
                                    errors: 'Internal error. Try again.',
                                    validationError: false,
                                });
                                console.log('ERROR: ', err);
                                res.status(500).send({
                                    errors: errors,
                                    validationError: false,
                                });
                            }
                        });
                } else {
                    errors.push({
                        error: 'User already registered with this email!',
                    });
                    res.status(400).send({
                        errors: errors,
                        validationError: true,
                    });
                }
            });
        }
    }
});

module.exports = router;
