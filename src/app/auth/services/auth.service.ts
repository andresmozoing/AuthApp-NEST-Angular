import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { enviroment } from 'src/environments/enviroments';
import { AuthStatus, LoginResponse, User } from '../interfaces';
import { CheckTokenResponse } from '../interfaces/check-token.response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl : string = enviroment.baseUrl;

  private http = inject(HttpClient)

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  //! Al mundo exterior
  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );

  constructor() { }

  login( email: string, password: string ): Observable<boolean> {

    const url  = `${ this.baseUrl }/auth/login`;
    const body = { email, password };

    return this.http.post<LoginResponse>( url, body )
      .pipe(
        map( ({ user, token }) => this.setAuthentication( user, token )),
        catchError( err => throwError( () => err.error.message ))
      );
  }

  private setAuthentication(user: User, token:string): boolean {

    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    localStorage.setItem('token', token);

    return true;
  }

  checkAuthStatus( ): Observable<boolean> {

    const token = localStorage.getItem('token')
    const url = this.baseUrl + '/check-token'
    if( !token)
      return of(false)

    const headers = new HttpHeaders().set('Authorization' ,  `Bearer ${token}`)

    return this.http.get<CheckTokenResponse>( url, {headers} )
      .pipe(
        map( ({ user, token }) => {
          this.setAuthentication( user, token )
          return true
        }),
        //Error
        catchError( () => {
          this._authStatus.set(AuthStatus.notAuthenticated)
          return of(false)
        })
      );
  }


}
