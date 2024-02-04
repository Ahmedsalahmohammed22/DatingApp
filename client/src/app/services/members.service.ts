import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  members:Member[]=[]
  baseUrl = environment.apiUrl;
  constructor(private http : HttpClient) { }

  getMembers(){
    if(this.members.length > 0) return of(this.members)
    return this.http.get<Member[]>(this.baseUrl + 'users' ).pipe(
      map(members => {
        this.members = members;
        return this.members;
      })
  );
  }

  getMember(username:String){
    const member = this.members.find(x => x.name === username);
    if(member) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username)
  }
  updateMember(member : Member){

    return this.http.put(this.baseUrl + 'users' , member).pipe(
      map(() =>{
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index] , ...{member}}
      })
    )
  }
  setMainPhoto(photoId : number){
    return this.http.put(this.baseUrl + 'Users/set-main-photo/'+photoId , {});
  }
  deletePhoto(photoId:number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  // getHttpOption(){
  //   const userString = localStorage.getItem('user');
  //   if(!userString) return;
  //   const User = JSON.parse(userString);
  //   return{
  //     headers : new HttpHeaders({
  //       Authorization:'Bearer ' + User.token 
  //     })
  //   }
  // }
}