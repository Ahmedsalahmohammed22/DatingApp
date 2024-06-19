import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { take } from 'rxjs';
import { Message } from 'src/app/models/message';
import { User } from 'src/app/models/user';
import { AccountService } from 'src/app/services/account.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm?:NgForm
  @Input() username? : string;
  messageContent = '';
  user? : User;

  constructor(public messageService : MessageService , private accountService : AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if(user){
          this.user = user
        }
      }
    })
   }

  ngOnInit(): void {
  }

  async sendMessage(){
    if(!this.username) return;
    this.messageService.sendMessage(this.username , this.messageContent)?.then(() =>{
      this.messageForm?.reset();      
    });
  }


}
