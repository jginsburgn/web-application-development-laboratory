const bcrypt = require('bcrypt');
const mongo = require('mongodb');
const randomstring = require("randomstring");

const collectionName = 'users';
const sessionsCollectionName = 'sessions';
const saltRounds = 10;

/**
* @param {*} email Email to look for user.
*/
async function getUser(email) {
  const collection = await getCollection(collectionName);
  return await collection.findOne({ email });
}

/**
* @param {*} userId Id of the requested user.
*/
async function getUserById(userId) {
  const collection = await getCollection(collectionName);
  return await collection.findOne({ _id: new mongo.ObjectID(userId) });
}

/**
* @throws user_does_not_exist The user given does not exist.
* @throws invalid_password The given password does not match.
* @returns token The session for the newly created token.
*/
async function createSession(email, password) {
  const user = await getUser(email);
  if (user == undefined) throw new Error('user_does_not_exist');
  if (bcrypt.compareSync(password, user.hash)) {
    const sessionsCollection = await getCollection(sessionsCollectionName);
    var token = randomstring.generate();
    while (await sessionsCollection.findOne({ userId: user._id, token }) != undefined) {
      token = randomstring.generate();
    }
    await sessionsCollection.insertOne({ userId: user._id, token });
    return token;
  }
  else {
    throw new Error('invalid_password');
  }
}

/**
* @throws user_does_not_exist The user given does not exist.
* @throws session_does_not_exist The token given does not belong to a valid session.
* @returns token The session for the newly created token.
*/
async function destroySession(email, token) {
  const user = await getUser(email);
  if (user == undefined) throw new Error('user_does_not_exist');
  const sessionsCollection = await getCollection(sessionsCollectionName);
  const result = await sessionsCollection.deleteOne({ userId: user._id, token });
  if (result.deletedCount == 0) throw new Error('session_does_not_exist');
}

/**
* @returns {boolean} True if the token is valid for a session of an existing user, false otherwise.
*/
async function validateSession(email, token) {
  const user = await getUser(email);
  if (user == undefined) return false;
  const sessionsCollection = await getCollection(sessionsCollectionName);
  const result = await sessionsCollection.findOne({ userId: user._id, token });
  console.log(`Session with token ${token} ${result != null ? 'valid' : 'invalid'} for ${email}`);
  return result != null;
}

/**
* @throws collision The user already exists.
* @throws bad_request The user object is incomplete.
* @param {*} user The user object to create.
*/
async function createUser(user) {
  const keys = ['name', 'lastName', 'university', 'password', 'email'];
  var insertable = {};
  for (var key of keys) {
    if (user[key] === undefined) {
      throw new Error('bad_request');
    }
    else {
      insertable[key] = user[key];
    }
  }
  const users = await getCollection(collectionName);
  var user = await getUser(insertable.email);
  if (user != undefined) throw new Error('collision');
  insertable.hash = bcrypt.hashSync(insertable.password, saltRounds);
  delete insertable.password;
  await users.insertOne(insertable);
}

module.exports = { createUser, createSession, destroySession, validateSession, getUser, getUserById };