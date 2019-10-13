/**
 * @file api_test.js
 * @description Tests for the backend api
 */
const mongoose = require('mongoose');
const assert = require('assert');
const supertest = require('supertest');
const mocha = require('mocha');

const baseUrl = supertest('localhost:3001');

let token = null;
let tempUsr = null;
const email = 'example.user1@email.com';

const api_login = async (request_body, endpoint) => {
    return baseUrl
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send(request_body);
};

const api_post = async (request_body, token, endpoint) => {
    return baseUrl
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(request_body);
};

const api_patch = async (request_body, token, endpoint) => {
    return baseUrl
        .patch(endpoint)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(request_body);
};

const api_get = async (request_body, token, endpoint) => {
    return baseUrl
        .get(endpoint)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(request_body);
};

const api_delete = async (request_body, token, endpoint) => {
    return baseUrl
        .delete(endpoint)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(request_body);
};

describe('API_TESTING', () => {
    it('Tries to register with correct information', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaaja@testijäbä.testi',
            password: 'testi123',
            password2: 'testi123',
            email2: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 200);
            const msg = res.body.msg;
            assert(msg === 'registered');
            done();
        });
    });

    it('Tries to register with incorrect information (missing @)', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaajatestijäbä.testi',
            password: 'testi123',
            password2: 'testi123',
            email2: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 400);
            const error = res.body.errors[0].error;
            assert(error === 'Not a valid email!');
            done();
        });
    });

    it('Tries to register with incorrect information (not matching emails)', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaaja@testijäbä.testi.eimätsää',
            password: 'testi123',
            password2: 'testi123',
            email2: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 400);
            const error = res.body.errors[0].error;
            assert(error === "Emails don't match!");
            done();
        });
    });

    it('Tries to register with incorrect information (not matching passwords)', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaaja@testijäbä.testi',
            password: 'testi123.eimätsää',
            password2: 'testi123',
            email2: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 400);
            const error = res.body.errors[0].error;
            assert(error === "Passwords don't match!");
            done();
        });
    });

    it('Tries to register with incorrect information (too short password)', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaaja@testijäbä.testi',
            password: '123',
            password2: '123',
            email2: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 400);
            const error = res.body.errors[0].error;
            assert(error === 'Password needs to be 6 characters or more!');
            done();
        });
    });

    it('Tries to register with incorrect information (missing parameters)', done => {
        const bod = {
            firstName: 'testaaja',
            lastName: 'testijäbä',
            email: 'testaaja@testijäbä.testi',
        };
        //Registering is done with the same template as logging in
        api_login(bod, '/users/register').then(res => {
            assert(res.status === 500);
            const error = res.body.error;
            assert(error === 'Missing parameters, please fill out all the required fields');
            done();
        });
    });

    it('Tries to login with incorrect information', done => {
        const bod = {email: 'example.user11111@email.com', pass: 'example1111'};
        api_login(bod, '/users/login').then(res => {
            assert(res.status === 401);
            const errors = res.body[0].error;
            assert(errors === 'Incorrect email or password!');
            done();
        });
    });

    it('Tries to login with missing parameters', done => {
        const bod = {email: 'example.user11111@email.com'};
        api_login(bod, '/users/login').then(res => {
            assert(res.status === 400);
            const errors = res.body[0].error;
            assert(errors === 'Bad request. Missing parameters');
            done();
        });
    });

    //This 'test' only gets a token to be used for the rest of the tests.
    it('GET THE TOKEN FOR THE REST OF THE TESTS', done => {
        const bod = {email: 'example.user1@email.com', pass: 'example1'};
        api_login(bod, '/users/login').then(res => {
            token = res.body.token;
            done();
        });
    });

    it('Create an activity for a non existing day', done => {
        const date = new Date().toISOString().split('T')[0];
        const activity = {
            aerobic: false,
            routines: [
                {
                    sets: [{weight: '20'}, {weight: '30'}],
                    reps: 12,
                    type: 'testtype',
                },
                {
                    sets: [{weight: '30'}, {weight: '20'}],
                    reps: 10,
                    type: 'testtype2',
                },
            ],
        };
        const bod = {date, activity, email};
        api_post(bod, token, '/users/day/activity').then(res => {
            tempUsr = res.body.usr;
            assert(res.status === 200);
            assert(res.body.usr.days.length === 2);
            done();
        });
    });

    it('Deletes an activity', done => {
        const activityId = tempUsr.days[0].activities[0].activityId;
        const date = tempUsr.days[0].date;
        const bod = {
            email: email,
            date: date,
            activityID: activityId,
        };
        api_delete(bod, token, '/users/day/activity').then(res => {
            assert(res.status === 200);
            done();
        });
    });

    it('Delete an activity as a non user', done => {
        const activityId = tempUsr.days[0].activities[0].activityId;
        const date = tempUsr.days[0].date;
        const bod = {
            email: 'Thisisnotauser@nouser.com',
            date: date,
            activityID: activityId,
        };
        api_delete(bod, token, '/users/day/activity').then(res => {
            //Error status 404 / User not found is a success
            assert(res.status === 404);
            assert(res.body[0].error === 'User not found');
            done();
        });
    });

    it('Tries to delete an activity for non existing day', done => {
        const activityId = tempUsr.days[0].activities[0].activityId;
        const date = 'this is not a day';
        const bod = {
            email: email,
            date: date,
            activityID: activityId,
        };
        api_delete(bod, token, '/users/day/activity').then(res => {
            //Error status 404 / Date not found is a success
            assert(res.status === 404);
            assert(res.body[0].error === 'Date not found');
            done();
        });
    });
});
