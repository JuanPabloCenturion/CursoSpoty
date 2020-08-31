import { Component, OnInit } from '@angular/core';
import { User } from './models/user'
import { UserService } from './services/user.service';
import { GLOBAL } from './services/global';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})
export class AppComponent implements OnInit{
  public title = 'Musify';
  public user: User;
  public userRegister: User;
  public identity;
  public token;
  public errorMessage;
  public alertRegister;
  public url: string;

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router
  ){
    this.user = new User('','','','','','','');
    this.userRegister = new User('','','','','','','');
    this.url = GLOBAL.url;
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  public onSubmit(){

    //Conseguir los datos del usuario identificado
    this._userService.signup(this.user).subscribe(
      response => {
        let identity = response.user;
        this.identity = identity;

        if(!this.identity._id){
          alert("El usuario no esta correctamente identificado");
        } else {
          //Crear elemento en el localstorage
          localStorage.setItem('identity', JSON.stringify(identity));
          
          //Conseguir token
          this._userService.signup(this.user, 'true').subscribe(
            response => {
              let token = response.token;
              this.token = token;
      
              if(this.token.length <= 0){
                alert("El token no se ha generado");
              } else {
                localStorage.setItem('token', JSON.stringify(token));

              }
            },
            error => {
              var errorMessage = <any>error;
              var body = JSON.parse(error._body);
              if(errorMessage != null){
                this.errorMessage = body.message; 
                console.log(error)
              }
            }
          );
        }
      },
      error => {
        var errorMessage = <any>error;
        var body = JSON.parse(error._body);
        if(errorMessage != null){
          this.errorMessage = body.message; 
          console.log(error)
        }
      }
    );
  }

  public logout(){
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    localStorage.clear();
    this.identity = null;
    this.token = null;
    this.user = new User('','','','','','','');

    this._router.navigate(['/']);
  }


  public onSubmitRegister(){
    console.log({userRegiset: this.userRegister});

    this._userService.register(this.userRegister).subscribe(
      response =>{
        let user = response.user;

        this.userRegister = user;
        if(!user._id){
          this.alertRegister = 'Error al registrarse';
        } else {
          this.alertRegister = 'El registro se ha realizado correctamente, identificate con: ' + this.userRegister.email;
          this.userRegister = new User('','','','','','','');
        }
      },
      error => {
        var errorMessage = <any>error;
        var body = JSON.parse(error._body);
        if(errorMessage != null){
          this.alertRegister = body.message; 
          console.log(error)
        }
      }
    );
  }
}
