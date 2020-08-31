'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res){
    var artistId = req.params.id

    Artist.findById(artistId, (err, artistFound) => {
        if(err){
            res.status(500).send({message: 'Error en la peticion a la db'})
        } else {
            if(!artistFound) {
                res.status(404).send({message: 'El artista no existe'})
            } else {
                res.status(200).send({artistFound})
            }
        }

    })
}

function saveArtist(req, res) {
    var artist = new Artist();

    artist.name = req.body.name
    artist.description = req.body.description
    artist.image = 'null'

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'})
        } else {
            if(!artistStored) {
                res.status(404).send({message: 'El artista no a sido guardado'})
            } else {
                res.status(200).send({artist: artistStored})
            }
        }
    })

}

function getArtists(req, res) {
    if(req.params.page) {
        var page = req.params.page
    } else {
        var page = 1
    }
    
    var itemsPerPage = 5

    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
        if(err){
            res.status(500).send({message: 'Error en la peticion'})
        } else {
            if(!artists){
                res.status(404).send({message: 'No hay artistas'})
            } else {                
                return res.status(200).send({
                    total_items: total,
                    artists: artists
            })
            }
        }
    })
}

function updateArtist(req, res) {
    var artistId = req.params.id
    var update = req.body

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar el artista'})
        } else {
            if(!artistUpdated) {
                res.status(404).send({message: 'El artista no existe'})
            } else {
                return res.status(200).send({ artist: artistUpdated })
            }
        }
    })
}

function deleteArtist(req, res) {
    var artistId = req.params.id

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message: 'Error al eliminar el artista'})
        } else {
            if ( !artistRemoved ) {
                res.status(404).send({message: 'El artista no ha sido eliminado'})
            } else {

                Album.find( { artist: artistRemoved._id} ).remove((err, removedAlbum) => {
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
                                        res.status(200).send({artistRemoved})
                                    }
                                                      
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

function uploadImage(req,res){
    var artistId = req.params.id
    var file_name = 'No subido'

    if(req.files){
        var file_path = req.files.image.path
        var file_split = file_path.split('\\')
        var file_name = file_split[2]
        
        var ext_split = file_name.split('\.')
        var file_ext = ext_split[1]

        console.log(ext_split)

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' ){
            Artist.findByIdAndUpdate(artistId, { image: file_name }, (err, userUpdated) => {
                if(err){
                    res.status(500).send({message: 'Error en el servidor al actualizar el usuario'});
                } else {
                    if(!userUpdated){
                        res.status(404).send({message: 'El usuario no fue encontrado'});
                    } else {
                        res.status(200).send({user: userUpdated});
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
    var path_file = './uploads/artists/' + imageFile

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    })
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}