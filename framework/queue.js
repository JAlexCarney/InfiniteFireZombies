class Queue{
    constructor(){
        this.contents = new Array(0);
    }

    get length(){
        return this.contents.length;
    }

    pop(){
        this.sort();
        if(this.contents.length > 0){
            let temp = this.contents[0];
            this.contents.shift();
            return temp;
        }
        return null;
    }

    push(priority, obj){
        this.contents.push({'priority': priority, 'obj': obj});
    }

    sort(){
        //insertion sort
        let size = this.contents.length;
        for(var i = 1, j; i < size; i++) {
            var temp = this.contents[i];
            for(var j = i - 1; j >= 0 && this.contents[j].priority > temp.priority; j--) {
                this.contents[j+1] = this.contents[j];
            }
            this.contents[j+1] = temp;
        }
    }
}