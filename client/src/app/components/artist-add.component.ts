import {Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { promise } from 'selenium-webdriver';
import { GLOBAL } from '../services/global'
import { Artist } from 'app/models/artist';
import { ArtistService } from '../services/artist.service'
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'artist-add',
    templateUrl: '../views/artist-add.html',
    providers: [UserService, ArtistService]
})

export class ArtistAddComponent implements OnInit{
    public titulo: string;
    public identity;
    public token;
    public alertMessage;
    public url: string;
    public artist: Artist;

    constructor(
        private _userService: UserService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _artistService: ArtistService
    ){
        this.titulo = 'Crear nuevo artista';  
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.artist = new Artist('','','', '');
    }

    ngOnInit(){
        console.log(('artist-add.component cargado'));
    }

    onSubmit(){
        console.log(this.artist);      
        this._artistService.addArtist(this.token, this.artist).subscribe(
            response => {                
                if(!response.artist){
                    alert('Error en el servidor');
                } else {
                    this.alertMessage = '¡El artista a sido creado!';
                    this.artist = response.artist;
                    console.log(this.artist);                    
                    this._router.navigate(['/editar-artista', response.artist._id]);
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
    }
}
