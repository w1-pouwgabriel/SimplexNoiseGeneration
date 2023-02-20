

export default class Constrols{
    
    
    constructor(){

        document.addEventListener("keydown", this.KeyDown);
    }

    private KeyDown(event: KeyboardEvent){
        if(event.key == 'ArrowUp'){
            console.log(event);
        }
    }
}