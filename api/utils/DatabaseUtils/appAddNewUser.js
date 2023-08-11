const { MongoClient } = require('mongodb');
const { hashPassword } = require('../authUtils');
const config = require('../../config/config');

const mongoClient = new MongoClient(config.mongoUrl);

async function addNewUser(user) {
  const hash = await hashPassword(user.password);
  user.password = hash;
  try {
    await mongoClient.connect();
    const db = mongoClient.db('todolist');
    const usersCollection = db.collection('users');
    await usersCollection.insertOne(user);
  } catch (err) {
    console.log(err);
  }
}

const user = {
  username: 'test',
  password: 'test',
  email: 'test@test.com',
};

addNewUser(user);
