import { Routes } from '@angular/router';
import { LoginScreen } from './user-module/login-screen/login-screen';
import { ChatScreen } from './chat-screen/chat-screen';
import { authGuard} from './auth.guard';
import { NewUserScreen } from './user-module/new-user-screem/new-user-screem';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
    },
    {   
        path: "login",
        loadComponent:  () => LoginScreen
    },
    {   
        path:"chat",
        loadComponent:() => ChatScreen,
        canActivate:[authGuard],
    }, 
    {
          path:"new-user",
        loadComponent: () => NewUserScreen
    }

];
