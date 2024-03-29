import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model:any ={}
  currentUser$ : Observable< User | null> = of(null);

  constructor(private accountService : AccountService , private router : Router, private toastr :ToastrService) { }

  ngOnInit(): void {
      this.currentUser$ = this.accountService.currentUser$
      console.log(this.currentUser$)
  }

  login(){
   this.accountService.login(this.model).subscribe({
    next :() => this.router.navigateByUrl('/members'),
   })
  }
  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/');

  }

}
