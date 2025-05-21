// server/__tests__/boardgame.test.js
const request = require('supertest');
const app = require('../app'); // Main Express app instance
const BoardGame = require('../models/BoardGame');
const mongoose = require('mongoose');

describe('BoardGame API', () => {
  let adminToken;
  let userToken;
  let adminUserId;
  let regularUserId;

  beforeAll(async () => {
    // Register and login an admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'boardgameadmin', password: 'password123' });
    adminUserId = adminRes.body.user._id; // First user is admin

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'boardgameadmin', password: 'password123' });
    adminToken = adminLoginRes.body.token;

    // Register and login a regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'boardgameregularuser', password: 'password123' });
    regularUserId = userRes.body.user._id;

    const userLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'boardgameregularuser', password: 'password123' });
    userToken = userLoginRes.body.token;
  });
  
  // Test POST /api/boardgames (create a board game - needs auth)
  it('should create a new board game when authenticated as a regular user', async () => {
    const res = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Game User',
        designer: 'User Designer',
        genre: 'User Genre',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Game User');
    expect(res.body).toHaveProperty('_id');
  });

  it('should create a new board game when authenticated as an admin user', async () => {
    const res = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Game Admin',
        designer: 'Admin Designer',
        genre: 'Admin Genre',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Game Admin');
  });
  
  it('should fail to create a board game without a title', async () => {
    const res = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        designer: 'Some Designer',
        genre: 'Strategy',
      });
    expect(res.statusCode).toEqual(400);
    // The exact message might vary based on Mongoose validation or custom checks
    expect(res.body.message).toContain('Title is required'); 
  });

  it('should fail to create a board game without authentication', async () => {
    const res = await request(app)
      .post('/api/boardgames')
      .send({
        title: 'Unauthorized Game',
        designer: 'No One',
        genre: 'Mystery',
      });
    expect(res.statusCode).toEqual(401); // Or 403 if token is invalid/missing
  });

  // Test GET /api/boardgames (get all board games - public)
  it('should get all board games', async () => {
    // Create a game first to ensure the list is not empty
    await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Game For GET Test', designer: 'Designer', genre: 'Test' });

    const res = await request(app).get('/api/boardgames');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1); // Should have at least one game
    const foundGame = res.body.find(game => game.title === 'Game For GET Test');
    expect(foundGame).toBeDefined();
  });

  // Test GET /api/boardgames/:id (get a single board game - public)
  it('should get a single board game by ID', async () => {
    const newGameRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Specific Game', designer: 'Specific Designer', genre: 'ID Test' });
    const gameId = newGameRes.body._id;

    const res = await request(app).get(`/api/boardgames/${gameId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', gameId);
    expect(res.body).toHaveProperty('title', 'Specific Game');
  });

  it('should return 404 for a non-existent board game ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/boardgames/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
  });
  
  it('should return 400 for an invalid board game ID format', async () => {
    const invalidId = '123invalid';
    const res = await request(app).get(`/api/boardgames/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Invalid ID format');
  });

  // Test PUT /api/boardgames/:id (update a board game - needs auth, admin role)
  it('should update a board game when authenticated as admin', async () => {
    const gameToUpdateRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`) // Create game as admin or any user
      .send({ title: 'Game to Update', designer: 'Old Designer', genre: 'To Be Updated' });
    const gameId = gameToUpdateRes.body._id;

    const res = await request(app)
      .put(`/api/boardgames/${gameId}`)
      .set('Authorization', `Bearer ${adminToken}`) // Update as admin
      .send({ title: 'Updated Game Title', designer: 'New Designer' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Updated Game Title');
    expect(res.body).toHaveProperty('designer', 'New Designer');
  });

  it('should fail to update a board game when authenticated as a regular user', async () => {
    const gameToUpdateRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`) // Create game as admin
      .send({ title: 'Admin Game For User Update Test', designer: 'Admin', genre: 'Test' });
    const gameId = gameToUpdateRes.body._id;

    const res = await request(app)
      .put(`/api/boardgames/${gameId}`)
      .set('Authorization', `Bearer ${userToken}`) // Attempt update as regular user
      .send({ title: 'User Attempted Update' });

    expect(res.statusCode).toEqual(403); // Forbidden
    expect(res.body.message).toBe('Forbidden: Insufficient role');
  });
  
  it('should fail to update a board game without authentication', async () => {
    const gameToUpdateRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Game For No Auth Update Test', designer: 'Admin', genre: 'Test' });
    const gameId = gameToUpdateRes.body._id;

    const res = await request(app)
      .put(`/api/boardgames/${gameId}`)
      .send({ title: 'No Auth Update Attempt' });
    expect(res.statusCode).toEqual(401);
  });

  // Test DELETE /api/boardgames/:id (delete a board game - needs auth, admin role)
  it('should delete a board game when authenticated as admin', async () => {
    const gameToDeleteRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`) // Create game as admin
      .send({ title: 'Game to Delete', designer: 'Admin', genre: 'Deletion Test' });
    const gameId = gameToDeleteRes.body._id;

    const res = await request(app)
      .delete(`/api/boardgames/${gameId}`)
      .set('Authorization', `Bearer ${adminToken}`); // Delete as admin

    expect(res.statusCode).toEqual(204);

    // Verify it's actually deleted
    const getRes = await request(app).get(`/api/boardgames/${gameId}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should fail to delete a board game when authenticated as a regular user', async () => {
    const gameToDeleteRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`) // Create game as admin
      .send({ title: 'Admin Game For User Delete Test', designer: 'Admin', genre: 'Test' });
    const gameId = gameToDeleteRes.body._id;

    const res = await request(app)
      .delete(`/api/boardgames/${gameId}`)
      .set('Authorization', `Bearer ${userToken}`); // Attempt delete as regular user

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Forbidden: Insufficient role');
  });
  
  it('should fail to delete a board game without authentication', async () => {
    const gameToDeleteRes = await request(app)
      .post('/api/boardgames')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Game For No Auth Delete Test', designer: 'Admin', genre: 'Test' });
    const gameId = gameToDeleteRes.body._id;

    const res = await request(app).delete(`/api/boardgames/${gameId}`);
    expect(res.statusCode).toEqual(401);
  });
});
