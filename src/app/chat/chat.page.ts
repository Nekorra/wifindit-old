import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { IonContent } from '@ionic/angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messages: Observable<any[]>

  newMsg = '';
  chatTitle = '';
  currentUserId = this.auth.currentUserId;
  chat = null;

  @ViewChild(IonContent, { static: false }) content:IonContent;
  @ViewChild('input', { static: false }) msgInput: ElementRef;

  constructor(private route: ActivatedRoute,private auth:AuthService,private chatService:ChatService,private router:Router) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      this.chatService.getOneGroup(data.id).subscribe(res =>{
        this.chat = res;
        console.log('my chat: ', this.chat);
        this.messages = this.chatService.getChatMessages(this.chat.id).pipe(
          map(messages => {
            for(let msg of messages){
              msg['user']=this.getMsgFromName(msg['from']);
            }
            
            console.log('messages: ',messages);
            return messages;
          })
        );
      })
    })
  }


  sendMessage() {
    this.chatService.addChatMessage(this.newMsg,this.chat.id).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    })
  }

  resize() {
    this.msgInput.nativeElement.style.height = this.msgInput.nativeElement.scrollHeight +'px';
  }

  getMsgFromName(userId){
    for(let usr of this.chat.users){
      if(usr.id == userId){
        return usr.nickname;
      }
    }
    return 'deleted';
  }

  leave() {
    let newUsers = this.chat.users.filter(usr => usr.id != this.auth.currentUserId);

    this.chatService.leaveGroup(this.chat.id,newUsers).subscribe(res => {
      this.router.navigateByUrl('/chats');
    });
  }
}
