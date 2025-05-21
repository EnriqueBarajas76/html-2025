// server/__tests__/auth.test.js
const request = require('supertest');
const app = require('../app'); // Main Express app instance
const User = require('../models/User'); // User model
const mongoose = require('mongoose');

describe('Auth API', () => {
  // Test for successful user registration
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('username', 'testuser');
    expect(res.body.user).toHaveProperty('role', 'admin'); // First user is admin
    expect(res.body.user).not.toHaveProperty('passwordHash'); // Ensure passwordHash is not returned

    // Check user in DB
    const userInDb = await User.findOne({ username: 'testuser' });
    expect(userInDb).toBeTruthy();
    expect(userInDb.username).toBe('testuser');
    expect(userInDb.passwordHash).toBeDefined(); // Check that passwordHash is stored
    expect(userInDb.passwordHash).not.toBe('password123'); // Ensure it's hashed
  });

  // Test for duplicate username registration
  it('should fail to register a user with a duplicate username', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'duplicateuser',
        password: 'password123',
      });

    // Then, attempt to register the same username again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'duplicateuser',
        password: 'password456',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Username already taken');
  });
  
  // Test for registration with missing fields
  it('should fail to register with missing username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Username and password are required');
  });

  it('should fail to register with missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuserNoPass' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Username and password are required');
  });
  
  it('should fail to register with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'shortpassuser', password: '123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Password must be at least 6 characters long');
  });


  // Test for successful user login
  it('should log in an existing user successfully', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        password: 'password123',
      });

    // Then, attempt to log in
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'loginuser');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  // Test for login with incorrect username
  it('should fail to log in with an incorrect username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistentuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  // Test for login with incorrect password
  it('should fail to log in with an incorrect password', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'wrongpassuser',
        password: 'password123',
      });

    // Then, attempt to log in with the wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'wrongpassuser',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
  
  // Test for login with missing fields
  it('should fail to login with missing username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Username and password are required');
  });

  it('should fail to login with missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuserNoPassLogin' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Username and password are required');
  });
});
