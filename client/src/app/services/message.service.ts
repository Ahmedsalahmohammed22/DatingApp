import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Message } from '../models/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../models/user';
import { BehaviorSubject, take } from 'rxjs';
import { group } from '@angular/animations';
import { Group } from '../models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  public hubConnection? : HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http : HttpClient) { }

  createHubConnection(user : User , otherUsername : string){
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername,{
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

      this.hubConnection.start().then(()=> console.log("connect"))
      .catch(error => console.log('Error establishing the connection: ', error));

      this.hubConnection.on('ReceiveMessageThread' , messages => {
        this.messageThreadSource.next(messages);
        console.log(messages)
      })

      this.hubConnection.on("UpdatedGroup" , (group : Group) =>{
        if(group.connections.some(x => x.username === otherUsername)){
          this.messageThread$.pipe(take(1)).subscribe({
            next : messages =>{
              messages.forEach(message =>{
                if(!message.dateRead){
                  message.dateRead = new Date(Date.now());
                }
              })
              this.messageThreadSource.next([...messages]);
            }
          })
        }
      }) 
      this.hubConnection.on('NewMessage' , message => {
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          this.messageThreadSource.next([...messages , message])
        })
      })
  }

  stopHubConnection(){
    if(this.hubConnection){
      this.hubConnection?.stop().catch(error => console.log('Error stopping the connection: ', error));
    }
  }




  getMessages(pageNumber : number , pageSize : number , container : string){
    let params = getPaginationHeaders(pageNumber , pageSize);
    params = params.append('Container' , container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages' , params , this.http);
  }
  getMessagesThread(username : string){
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username : string , content : string){
    return this.hubConnection?.invoke('SendMessage' , {recipientUsername : username , content})
    .catch(error => console.log(error))
  }
  deleteMessage(id : number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }

  getHubConnectionState() {
    return this.hubConnection?.state;
  }
}
