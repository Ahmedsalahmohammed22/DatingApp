import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/models/member';
import { MembersService } from 'src/app/services/members.service';
import { PresenceService } from 'src/app/services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member:Member | undefined;


  constructor(private memberService : MembersService , private toastr : ToastrService , public presence : PresenceService) { }

  ngOnInit(): void {
    this.presence.onlineUsers$.subscribe((users: any) => console.log(users));
    console.log(this.member?.userName);

  }

  addLike(member : Member){
    console.log(member)
    this.memberService.addLike(member.userName).subscribe({
      next: () => this.toastr.success('You have liked ' + member.knownAs)
    })
  }

}
