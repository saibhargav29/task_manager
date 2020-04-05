import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor  {

  constructor(private authService: AuthService, private notifyService: NotificationService) { }

  refreshingAccessToken: boolean;

  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if(error.status === 401) {
           return this.refreshAccessToken()
          .pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log(err);
              this.authService.logout();
              return empty();
            })
          )
        }
        return throwError(error);
      })
    )

  }


  refreshAccessToken() {
     
    if (this.refreshingAccessToken) {
        return new Observable(observer => {
          this.accessTokenRefreshed.subscribe(() => {
            observer.next();
            observer.complete(); 
          })
        })
    } else {
      this.refreshingAccessToken = true;
      return this.authService.getNewAccessToken().pipe( 
      tap(() => {
          this.refreshingAccessToken = false;
          console.log("Access token refreshed");
          this.accessTokenRefreshed.next();
       })
      )
    }

    
  }

  addAuthHeader(request: HttpRequest<any>) {
    const token = this.authService.getAccessToken();
    if(token) {
      return request.clone({
        setHeaders: {
          'x-access-token' : token
        }
      })
    }
    return request;
  }

}
