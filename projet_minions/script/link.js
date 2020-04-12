let socket = io.connect('http://10.8.0.2:6969');
let myTurn = false;
let isBlack = false;
let pseudo =  getRdnId(8);
socket.emit('add user', pseudo);

socket.on("login", (message) => {
    console.log(message);
});

socket.on("user joined", (data) => {
    console.log(data);
});

socket.on("game start", (data) => {
    hugoBoard = data.map;
    if(data.noir == pseudo) isBlack = true;
    if(data.au_tour_de == pseudo) {
        console.log("C'est à mon tour !")
        myTurn = true;
    }
    console.log(hugoBoard);
});

function getToServer(id, new_id){
    myTurn = false;
    let arr = {
        id: id,
        new_id: new_id
    }
    socket.emit('move', arr);
}

function moveToServer(id, x, y){
    myTurn = false;
    let arr = {
        id: id,
        x : x,
        y : y
    }
    socket.emit('move', arr);
}

socket.on("map update", (data) => {
    console.log(data);
    hugoBoard = data.map;
    if(data.au_tour_de == pseudo) {
        console.log("C'est à mon tour !")
        //ON actualise la position du pion ennemi
        for (let i = 0; i < meshesArray.length; i++) {
            for (let j = 0; j < meshesArray[i].length; j++) {
                if(meshesArray[i][j] != null){
                    //On supprime le mesh si il a été del
                    if(data.del != null){
                        if(meshesArray[i][j][1].id == data.del){
                            meshesArray[i][j][1].dispose();
                        }
                    }
                    if(meshesArray[i][j][1].id == data.id){
                        meshesArray[i][j][0].setAbsolutePosition(getAbsolutePositionOnBoardEnnemy(boardPosition, parseInt(data.x),parseInt(data.y), isBlack));
                    }
                }
            }
        }

        myTurn = true;
    }
});