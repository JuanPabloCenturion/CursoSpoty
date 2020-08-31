'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');

var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res){
    var songId = req.params.id

    Song.findById(songId).populate({path: 'album'}).exec( (err, songFound) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!songFound) {
                res.status(404).send({message: 'La cancion no existe'})
            } else {
                res.status(200).send({songFound})
            }
        }

    })
}

function getSongs(req, res) {
    var albumId = req.params.id

    if(!albumId) {
        var find = Song.find({}).sort('number')
    } else {
        var find = Song.findById(albumId).sort('number')
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function(err, songs) {
        if(err){
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!songs) {
                res.status(404).send({message: 'No hay canciones'})
            } else {
                res.status(200).send({songs})
            }
        }
    })
}

function saveSong(req, res){
    var song = new Song()

    song.name = req.body.name
    song.number = req.body.number
    song.duration = req.body.duration
    song.file = null
    song.album = req.body.album

    song.save((err, songStore) => {
        if(err){
            res.status(500).send({message: 'Error al guardar la cancion'})
        } else {
            if(!songStore) {
                res.status(404).send({message: 'La cancion no a sido guardado'})
            } else {
                res.status(200).send({songStore})
            }
        }
    })
}

function updateSong(req, res){
    var songId = req.params.id
    var update = req.body

    Song.findByIdAndUpdate(songId, update, (err,songUpdate) => {
        if(err){
            res.status(500).send({message: 'Error al guardar la cancion'})
        } else {
            if(!songUpdate) {
                res.status(404).send({message: 'La cancion no a sido guardado'})
            } else {
                res.status(200).send({songUpdate})
            }
        }
    })
}

function deleteSong(req,res) {
    var songId = req.params.id
    Song.findByIdAndDelete(songId, (err, deletedSong) => {
        if(err){
            res.status(500).send({message: 'Error al eliminar la cancion'})
        } else {
            if(!deletedSong) {
                res.status(404).send({message: 'La cancion no existe'})
            } else {
                res.status(200).send({deletedSong})
            }
        } 
    })
}

function uploadFile(req,res){
    var songId = req.params.id
    var file_name = 'No subido'

    if(req.files){
        var file_path = req.files.file.path
        var file_split = file_path.split('\\')
        var file_name = file_split[2]
        
        var ext_split = file_name.split('\.')
        var file_ext = ext_split[1]

        console.log(ext_split)

        if(file_ext == 'mp3' || file_ext == 'mp4' || file_ext == 'ogg' ){
            Song.findByIdAndUpdate(songId, { file: file_name }, (err, songUpdate) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor al actualizar la cancion'});
                } else {
                    if(!songUpdate){
                        res.status(404).send({message: 'No se ha actualizado la cancion'});
                    } else {
                        res.status(200).send({songUpdate});
                    }
                }
            })
        } else {
            res.status(200).send({message: 'Extension del archivo no valida'});
        }
    } else {
        res.status(200).send({message: 'No se a subido la cancion'});
    }
}

function getSongFile(req, res){
    var songFile = req.params.songFile
    var path_file = './uploads/songs/' + songFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else {
            res.status(200).send({message: 'No existe la cancion'});
        }
    })
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    getSongFile,
    uploadFile
}