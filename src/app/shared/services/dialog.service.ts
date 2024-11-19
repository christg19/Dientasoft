import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
    providedIn: 'root'
})

export class DialogService {
    constructor(

    ) {

    }

    showErrorMessage(message: string) {
        let timerInterval: any;
    
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${message}`,
            timer: 3000, 
            timerProgressBar: true,
            didOpen: () => {
               
                const timer = Swal.getPopup()?.querySelector("b");
                if (timer) {
                    timerInterval = setInterval(() => {
                        timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 100);
                }
            },
            willClose: () => {
                clearInterval(timerInterval); 
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log("El mensaje de error fue cerrado por el temporizador.");
            }
        });
    }
    

    showSavedMessage(functionRef: Function, message: string) {
        Swal.fire({
            title: `${message}`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Guardar",
            denyButtonText: `Cancelar`
        }).then((result) => {
            if (result.isConfirmed) {
                functionRef();
                Swal.fire("Guardado!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("Los cambios no han sido guardados", "", "info");
            }
        });
    }

    showConfirmMessage(message: string, confirmButtonColor: string, functionRef: Function, deletedText: string) {
        Swal.fire({
            title: `${message}`,
            text: "No podrás revertir este cambio!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `${confirmButtonColor}`
        }).then((result) => {
            if (result.isConfirmed) {
                functionRef();
                Swal.fire({
                    title: "Eliminado!",
                    text: `${deletedText}`,
                    icon: "success"
                });
            }
        });
    }
}