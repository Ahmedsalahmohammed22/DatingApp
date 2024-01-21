import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'https://localhost:7243/api/';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http : HttpClient) { }

  login(model : any){
    return this.http.post<User>(this.baseUrl + 'Accounts/login', model).pipe(
      map((response : User) => {
        const user = response;
        if(user){
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      }))
  } 
  setCurrentUser(user:User){
    this.currentUserSource.next(user)
  }
  logout(){
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
  
  register(model : any){
    return this.http.post<User>(this.baseUrl + 'Accounts/register', model).pipe(
      map(user => {
        if(user){
          localStorage.setItem('user' , JSON.stringify(user));
          this.currentUserSource.next(user)

        }
      })
    );

  }
}
