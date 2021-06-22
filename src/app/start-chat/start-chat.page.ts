import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.page.html',
  styleUrls: ['./start-chat.page.scss'],
})
export class StartChatPage implements OnInit {

  users=[];
  title='';
  participant='';

  constructor(private chatService:ChatService,private router:Router) { }

  ngOnInit() {
  }

  createGroup(){
    this.chatService.createGroup(this.title,this.users).then(res => {
      this.router.navigateByUrl('/chats');
    });
  }

  addUser(){
    let obs = this.chatService.findUser(this.participant, null);

    forkJoin(obs).subscribe(res => {
      console.log('res: ',res);
      for(let data of res) {
        if(data.length > 0){
          console.log('data: ',data);
          this.users.push(data[0]);
        }
      }
      this.participant = '';
    });
  }
}
