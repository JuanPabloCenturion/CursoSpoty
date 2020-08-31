'use strict'

var express = require('express');
var SongController = require('../controllers/song');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/songs'})

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/song/:id', md_auth.ensureAuth, SongController.getSong);
api.get('/sons/:id?', md_auth.ensureAuth, SongController.getSongs);
api.post('/song', md_auth.ensureAuth, SongController.saveSong);
api.put('/song/:id', md_auth.ensureAuth, SongController.updateSong);
api.delete('/song/:id', md_auth.ensureAuth, SongController.deleteSong);

api.post('/upload-file-song/:id', [md_auth.ensureAuth, md_upload], SongController.uploadFile);
api.get('/get-song-file/:songFile', [md_upload], SongController.getSongFile);

module.exports = api



