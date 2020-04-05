import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
 

  constructor(private authService: AuthService , private notifyService: NotificationService, private router: Router) { }

  ngOnInit(): void {
  }

  onLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password).subscribe((res: HttpResponse<any>) => {
      if (res.status === 200) {
        this.notifyService.showSuccess(" Logged in Successfully", email);
        this.router.navigate(['/lists']);
      } 
       console.log(res);      
     },(error) => {
      this.notifyService.showError(" Invalid Username/Password");
    });
  }

}
