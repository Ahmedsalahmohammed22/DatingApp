import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../models/pagination';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';
import { User } from '../models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  members:Member[]=[]
  memberCache = new Map();
  baseUrl = environment.apiUrl;
  userParams : UserParams | undefined;
  user : User | undefined;

  constructor(private http : HttpClient , private accountService : AccountService ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if(user){
          this.userParams = new UserParams(user);
          this.user = user
        }
      }
    })
   }

  getMembers(UserParams : UserParams){
    const response = this.memberCache.get(Object.values(UserParams).join('-'));
    console.log(response);
    if(response) return of(response);
    let params = getPaginationHeaders(UserParams.pageNumber , UserParams.pageSize);
    params = params.append('minAge' , UserParams.minAge);
    params = params.append('maxAge' , UserParams.maxAge);
    params = params.append('gender' , UserParams.gender);
    params = params.append('orderBy' , UserParams.orderBy);

    
    // if(this.members.length > 0) return of(this.members)
    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params , this.http).pipe(
      map(response => {
        this.memberCache.set(Object.values(UserParams).join('-'),response);
        return response
      })
    );
  }

  getUserParams(){
    return this.userParams;
  }

  setUserParams(params : UserParams){
    this.userParams = params
  }

  resetUserParams(){
    if(this.user){
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMember(username:String){
    const member = [...this.memberCache.values()]
    .reduce((arr , elem) => arr.concat(elem.result),[])
    .find((member:Member) => member.name === username)
    console.log(member)
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

  addLike(username : string){
    return this.http.post(this.baseUrl + 'likes/' + username , {})
  }

  getLikes(predicate : string , pageNumber : number , pageSize : number){
    let params = getPaginationHeaders(pageNumber , pageSize);
    params = params.append('predicate' , predicate);
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes' , params , this.http);
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
