import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../models/pagination';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';
import { User } from '../models/user';

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
    let params = this.getPaginationHeaders(UserParams.pageNumber , UserParams.pageSize);
    params = params.append('minAge' , UserParams.minAge);
    params = params.append('maxAge' , UserParams.maxAge);
    params = params.append('gender' , UserParams.gender);
    params = params.append('orderBy' , UserParams.orderBy);

    
    // if(this.members.length > 0) return of(this.members)
    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
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



  private getPaginatedResult<T>(url : string , params: HttpParams) {
    const paginatedResult:PaginatedResult<T> = new PaginatedResult<T>; 
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) {
          paginatedResult.result = response.body;
        }
        const pagination = response.headers.get('Pagination');
        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        return paginatedResult;

      })
    );
  }

  private getPaginationHeaders(pageNumber : number , pageSize : number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    return params;
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
