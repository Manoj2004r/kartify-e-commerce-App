const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Liveness: process is up and responding
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness: dependencies (DB) are actually reachable
router.get('/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) {
    return res.status(200).json({ status: 'ready', db: 'connected' });
  }
  return res.status(503).json({ status: 'not-ready', db: 'disconnected' });
});

module.exports = router;
