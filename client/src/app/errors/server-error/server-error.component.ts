import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css']
})
export class ServerErrorComponent implements OnInit {

  constructor(private router : Router) {
    const navigation = this.router.getCurrentNavigation();
    console.log(navigation)
   }

  ngOnInit(): void {
  }

}
