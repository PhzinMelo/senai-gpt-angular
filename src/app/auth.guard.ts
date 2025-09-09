import { Router } from "@angular/router"
import { inject } from "@angular/core"  

export const authGuard= () =>{ 
    const  router= inject(Router)
    const token=localStorage.getItem("meuToken")
    const userId=localStorage.getItem("meuId")

    if(token !=null && userId !=null){  
        return true;
    } else{ 
        router.navigate(["/login"])
        return false;
    }
}