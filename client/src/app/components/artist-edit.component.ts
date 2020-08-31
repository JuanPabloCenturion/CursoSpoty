import {Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { promise } from 'selenium-webdriver';
import { GLOBAL } from '../services/global'
import { Artist } from 'app/models/artist';
import { ArtistService } from '../services/artist.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadService } from '../services/upload.service';


@Component({
    selector: 'artist-edit',
    templateUrl: '../views/artist-add.html',
    providers: [UserService, ArtistService, UploadService]
})

export class ArtistEditComponent implements OnInit{
    public titulo: string;
    public identity;
    public token;
    public alertMessage;
    public url: string;
    public artist: Artist;
    public is_edit: boolean;

    constructor(
        private _userService: UserService,
        private _route: ActivatedRoute, 
        private _router: Router,
        private _artistService: ArtistService,
        private _uploadService: UploadService
    ){
        this.titulo = 'Editar artista';  
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.artist = new Artist('','','', '');
        this.is_edit = true;
    }

    ngOnInit(){
        console.log(('artist-edit.component cargado'));
        this.getArtist();
    }

    getArtist(){
        this._route.params.forEach((params: Params) => {
            let id = params['id'];

            this._artistService.getArtist(this.token, id).subscribe(
                response => {                  
                    if(!response.artistFound){
                        this._router.navigate(['/']);
                    } else {
                        this.artist = response.artistFound;
                    }
                },
                error => {
                    var errorMessage = <any>error;
                    var body = JSON.parse(error._body);
                    if(errorMessage != null){
                      console.log(error)
                    }
                  }
            )
        });
    }

    onSubmit(){
        console.log(this.artist);
        
        this._route.params.forEach((params: Params) => {
            let id = params['id'];

            this._artistService.editArtist(this.token, id, this.artist).subscribe(
                response => {                
                    if(!response.artist){
                     alert('Error en el servidor');
                    } else {
                     console.log(this.artist);
                    this._uploadService.makeFileRequest(this.url+'upload-image-artist/'+id, [], this.filesToUpload, this.token, 'image')
                        .then(
                            (result) => {
                                this._router.navigate(['/artists', 1]);
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                    //this._router.navigate(['/editar-artista'], response.artist._id);
                 }
             },
                error => {
                    var errorMessage = <any>error;
                    var body = JSON.parse(error._body);
                     if(errorMessage != null){
                     console.log(error)
                    }
            }); 
        }); 
    }

    public filesToUpload: Array<File>;
    fileChangeEvent(fileInput: any){
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}
