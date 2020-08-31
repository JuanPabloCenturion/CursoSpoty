'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');

var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res){
    var albumId = req.params.id

    Album.findById(albumId).populate({path: 'artist'}).exec( (err, albumFound) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!albumFound) {
                res.status(404).send({message: 'El album no existe'})
            } else {
                res.status(200).send({albumFound})
            }
        }

    })
}

function getAlbums(req, res) {
    var artistId = req.params.artist

    if(!artistId) {
        var find = Album.find({}).sort('title')
    } else {
        var find = Album.find({artist: artistId}).sort('year')
    }

    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err) {
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!albums) {
                res.status(404).send({message: 'El album no existe'})
            } else {
                res.status(200).send({albums})
            }
        }
    })
}

function updateAlbum(req, res) {
    var albumId = req.params.id
    var update = req.body

    Album.findByIdAndUpdate(albumId, update, (err, updated) => {
        if(err) {
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!updated) {
                res.status(404).send({message: 'El album no existe'})
            } else {
                res.status(200).send({album: updated})
            }
        }
    })
}

function saveAlbum(req, res) {
    var album = new Album();

    album.title = req.body.title
    album.descripcion = req.body.description
    album.year = req.body.year
    album.image = 'null'
    album.artist = req.body.artist

    album.save((err, albumStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el album'})
        } else {
            if(!albumStored) {
                res.status(404).send({message: 'El album no a sido guardado'})
            } else {
                res.status(200).send({album: albumStored})
            }
        }
    })
}

function deleteAlbum(req, res){
    var albumId = req.params.id

    Album.findByIdAndRemove( albumId, (err, removedAlbum) => {
        if(err){
            res.status(500).send({message: 'Error al borrar el album'})
        } else {
            if ( !removedAlbum ) {
                res.status(404).send({message: 'El album no ha sido eliminado'})
            } else {
               
                Song.find( { album: removedAlbum._id} ).remove((err, removedSong) => {
                    if(err){
                        res.status(500).send({message: 'Error al borrar la cancion'})
                    } else {
                        if ( !removedSong ) {
                            res.status(404).send({message: 'La cancion no ha sido eliminada'})
                        } else {
                            res.status(200).send({removedAlbum})
                        }
                                          
                    }
                })
            }
        }
    })
}

function uploadImage(req,res){
    var albumId = req.params.id
    var file_name = 'No subido'

    if(req.files){
        var file_path = req.files.image.path
        var file_split = file_path.split('\\')
        var file_name = file_split[2]
        
        var ext_split = file_name.split('\.')
        var file_ext = ext_split[1]

        console.log(ext_split)

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' ){
            Album.findByIdAndUpdate(albumId, { image: file_name }, (err, albumUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor al actualizar el album'});
                } else {
                    if(!albumUpdated){
                        res.status(404).send({message: 'No se ha actualizado la imagen'});
                    } else {
                        res.status(200).send({albumUpdated});
                    }
                }
            })
        } else {
            res.status(200).send({message: 'Extension del archivo no valida'});
        }
    } else {
        res.status(200).send({message: 'No se a subido ninguna imagen'});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile
    var path_file = './uploads/albums/' + imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    })
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    getImageFile,
    uploadImage
}