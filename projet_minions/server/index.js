//PHP > all

//Mise en place du serveur
const server = require('http').createServer();
const port = 6969;
const io = require('socket.io')(server);

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

let onlineUsers = 0;
let joueurs = [];

//Plateau de jeu
let jeu = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

//2 tableaux en 2D permettant de détecter l'échec et échec et mat
let echecetmat_noir = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

let echecetmat_blanche = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

//Vérification des prises et positions possibles
function updateAll(){
    //reset mapping
    echecetmat_noir = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]];
    echecetmat_blanche = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]];

    //On passe par toute la carte, et on vérifie chaque case.
    //Si il y a un pion, on vérifie son type et on vérifie toutes les actions possibles pour ce même pion.
    for(let i = 0; i <= 7; i++){
        for(let j = 0; j <= 7; j++){
            if(jeu[i][j] !== 0) {
                let tocheck = jeu[i][j];

                let team = tocheck['team'];

                if(team === "Blanche") {
                    echecetmat_blanche[i][j] = team;
                }else{
                    echecetmat_noir[i][j] = team;
                }

                let reverse = "Blanche";

                if(team === "Blanche"){
                    reverse = "Noire";
                }

                let type = tocheck['type'];
                let newpos = [];

                //Vérification en premier lieu d'un pion
                if (type === 'Pion') {
                    if (team === 'Noire') {

                        if(i === 7){
                            jeu[i][j]['type'] = 'Dame';
                            updateAll();
                        }

                        if((i + 1) <= 7) {
                            if (jeu[i + 1][j] === 0) {
                                newpos.push({x: j, y: i + 1});
                            }
                        }

                        //On vérifie aussi les diagonales...
                        if((i + 1) <= 7 && (j-1) >= 0) {
                            if(jeu[i + 1][j - 1] !== 0) {
                                if (jeu[i + 1][j - 1]['team'] === "Blanche") {
                                    newpos.push({x: j - 1, y: i + 1});
                                }
                            }
                        }
                        if((i + 1) <= 7 && (j+1) <= 7) {
                            if(jeu[i + 1][j + 1] !== 0) {
                                if (jeu[i + 1][j + 1]['team'] === "Blanche") {
                                    newpos.push({x: j + 1, y: i + 1});
                                }
                            }
                        }

                        //il est sur la ligne de départ
                        if(i === 1){
                            //Peut se déplacer 1 ou 2 cases vers l'avant (check 1 case fait avant)

                            if((i + 2) <= 8) {
                                if (jeu[i + 2][j] === 0) {
                                    newpos.push({x: j, y: i + 2});
                                }
                            }
                        }

                    } else {

                        if(i === 0){
                            jeu[i][j]['type'] = 'Dame';
                            updateAll();
                        }

                        if((i - 1) >= 0) {
                            if (jeu[i - 1][j] === 0) {
                                newpos.push({x: j, y: i - 1});
                            }
                        }

                        //On vérifie aussi les diagonales...
                        if((i - 1) >= 0 && (j-1) >= 0) {
                            if(jeu[i - 1][j - 1] !== 0) {
                                if (jeu[i - 1][j - 1]['team'] === "Noire") {
                                    newpos.push({x: j - 1, y: i - 1});
                                }
                            }
                        }
                        if((i - 1) >= 0 && (j+1) <= 7) {
                            if(jeu[i - 1][j + 1] !== 0) {
                                if (jeu[i - 1][j + 1]['team'] === "Noire") {
                                    newpos.push({x: j + 1, y: i - 1});
                                }
                            }
                        }

                        //il est sur la ligne de départ
                        if(i === 6){
                            //Peut se déplacer 1 ou 2 cases vers l'avant (check 1 case fait avant)

                            if((i - 2) >= 0) {
                                if (jeu[i - 2][j] === 0) {
                                    newpos.push({x: j, y: i - 2});
                                }
                            }
                        }
                    }
                }else if(type === 'Tour') {
                    //Check à gauche
                    let tmp = 1;

                    while ((j - tmp) >= 0) {
                        if (jeu[i][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i});
                        } else if (jeu[i][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check à droite
                    tmp = 1;

                    while ((j + tmp) <= 7) {
                        if (jeu[i][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i});
                        } else if (jeu[i][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check en haut
                    tmp = 1;

                    while ((i - tmp) >= 0) {
                        if (jeu[i - tmp][j] === 0) {
                            newpos.push({x: j, y: i - tmp});
                        } else if (jeu[i - tmp][j]['team'] === reverse) {
                            newpos.push({x: j, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check en haut
                    tmp = 1;

                    while ((i + tmp) <= 7) {
                        if (jeu[i + tmp][j] === 0) {
                            newpos.push({x: j, y: i + tmp});
                        } else if (jeu[i + tmp][j]['team'] === reverse) {
                            newpos.push({x: j, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }
                }else if(type === "Cavalier") {
                    //On vérifie tous les cas possibles pour un cavalier...
                    if ((j - 2) >= 0 && (i - 1) >= 0) {
                        if (jeu[i - 1][j - 2]['team'] !== team) {
                            newpos.push({x: j - 2, y: i - 1});
                        }
                    }

                    if ((j - 1) >= 0 && (i - 2) >= 0) {
                        if (jeu[i - 2][j - 1]['team'] !== team) {
                            newpos.push({x: j - 1, y: i - 2});
                        }
                    }

                    if ((j + 1) <= 7 && (i - 2) >= 0) {
                        if (jeu[i - 2][j + 1]['team'] !== team) {
                            newpos.push({x: j + 1, y: i - 2});
                        }
                    }

                    if ((j + 2) <= 7 && (i - 1) >= 0) {
                        if (jeu[i - 1][j + 2]['team'] !== team) {
                            newpos.push({x: j + 2, y: i - 1});
                        }
                    }

                    if ((j + 2) <= 7 && (i + 1) <= 7) {
                        if (jeu[i + 1][j + 2]['team'] !== team) {
                            newpos.push({x: j + 2, y: i + 1});
                        }
                    }

                    if ((j + 1) <= 7 && (i + 2) <= 7) {
                        if (jeu[i + 2][j + 1]['team'] !== team) {
                            newpos.push({x: j + 1, y: i + 2});
                        }
                    }

                    if ((j - 1) >= 0 && (i + 2) <= 7) {
                        if (jeu[i + 2][j - 1]['team'] !== team) {
                            newpos.push({x: j - 1, y: i + 2});
                        }
                    }

                    if ((j - 2) >= 0 && (i + 1) <= 7) {
                        if (jeu[i + 1][j - 2]['team'] !== team) {
                            newpos.push({x: j - 2, y: i + 1});
                        }
                    }
                }else if(type === "Fou") {

                    //Check haut gauche
                    let tmp = 1;

                    while ((j - tmp) >= 0 && (i - tmp) >= 0) {
                        if (jeu[i - tmp][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i - tmp});
                        } else if (jeu[i - tmp][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check haut droite
                    tmp = 1;

                    while ((j + tmp) <= 7 && (i - tmp) >= 0) {
                        if (jeu[i - tmp][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i - tmp});
                        } else if (jeu[i - tmp][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check bas droite
                    tmp = 1;

                    while ((i + tmp) <= 7 && (j + tmp) <= 7) {
                        if (jeu[i + tmp][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i + tmp});
                        } else if (jeu[i + tmp][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check bas gauche
                    tmp = 1;

                    while ((j - tmp) >= 0 && (i + tmp) <= 7) {
                        if (jeu[i + tmp][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i + tmp});
                        } else if (jeu[i + tmp][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                }else if(type === "Dame") {
                    //Check haut gauche
                    let tmp = 1;

                    while ((j - tmp) >= 0 && (i - tmp) >= 0) {
                        if (jeu[i - tmp][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i - tmp});
                        } else if (jeu[i - tmp][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check haut droite
                    tmp = 1;

                    while ((j + tmp) <= 7 && (i - tmp) >= 0) {
                        if (jeu[i - tmp][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i - tmp});
                        } else if (jeu[i - tmp][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check bas droite
                    tmp = 1;

                    while ((i + tmp) <= 7 && (j + tmp) <= 7) {
                        if (jeu[i + tmp][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i + tmp});
                        } else if (jeu[i + tmp][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check bas gauche
                    tmp = 1;

                    while ((j - tmp) >= 0 && (i + tmp) <= 7) {
                        if (jeu[i + tmp][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i + tmp});
                        } else if (jeu[i + tmp][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check à gauche
                    tmp = 1;

                    while ((j - tmp) >= 0) {
                        if (jeu[i][j - tmp] === 0) {
                            newpos.push({x: j - tmp, y: i});
                        } else if (jeu[i][j - tmp]['team'] === reverse) {
                            newpos.push({x: j - tmp, y: i});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check à droite
                    tmp = 1;

                    while ((j + tmp) <= 7) {
                        if (jeu[i][j + tmp] === 0) {
                            newpos.push({x: j + tmp, y: i});
                        } else if (jeu[i][j + tmp]['team'] === reverse) {
                            newpos.push({x: j + tmp, y: i});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check en haut
                    tmp = 1;

                    while ((i - tmp) >= 0) {
                        if (jeu[i - tmp][j] === 0) {
                            newpos.push({x: j, y: i - tmp});
                        } else if (jeu[i - tmp][j]['team'] === reverse) {
                            newpos.push({x: j, y: i - tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }

                    //Check en haut
                    tmp = 1;

                    while ((i + tmp) <= 7) {
                        if (jeu[i + tmp][j] === 0) {
                            newpos.push({x: j, y: i + tmp});
                        } else if (jeu[i + tmp][j]['team'] === reverse) {
                            newpos.push({x: j, y: i + tmp});
                            break;
                        } else {
                            break;
                        }

                        tmp++;
                    }
                }else if(type === "Roi"){
                    if((j-1) >= 0 && (i-1) >= 0){
                        if(jeu[i-1][j-1]['team'] !== team){
                            newpos.push({x: j-1, y: i-1});
                        }
                    }

                    if((i-1) >= 0){
                        if(jeu[i-1][j]['team'] !== team){
                            newpos.push({x: j, y: i-1});
                        }
                    }

                    if((j+1) <= 7 && (i-1) >= 0){
                        if(jeu[i-1][j+1]['team'] !== team){
                            newpos.push({x: j+1, y: i-1});
                        }
                    }

                    if((j+1) <= 7){
                        if(jeu[i][j+1]['team'] !== team){
                            newpos.push({x: j+1, y: i});
                        }
                    }

                    if((j+1) <= 7 && (i+1) <= 7){
                        if(jeu[i+1][j+1]['team'] !== team){
                            newpos.push({x: j+1, y: i+1});
                        }
                    }

                    if((i+1) <= 7){
                        if(jeu[i+1][j]['team'] !== team){
                            newpos.push({x: j, y: i+1});
                        }
                    }

                    if((j-1) >= 0 && (i+1) <= 7){
                        if(jeu[i+1][j-1]['team'] !== team){
                            newpos.push({x: j-1, y: i+1});
                        }
                    }

                    if((j-1) >= 0){
                        if(jeu[i][j-1]['team'] !== team){
                            newpos.push({x: j-1, y: i});
                        }
                    }
                }else{
                    console.log(type);
                }

                let sendpos = [];
                let prises_possibles = [];

                //On différencie les prises possibles des cases vides, et on rempli les 2 tableaux pour l'échec et échec et mat.
                newpos.forEach(function(item){
                   if(team === "Noire"){
                       echecetmat_blanche[item['y']][item['x']] = "Noire";
                   }else{
                       echecetmat_noir[item['y']][item['x']] = "Blanche";
                   }

                   if(jeu[item['y']][item['x']] !== 0){
                       prises_possibles.push(jeu[item['y']][item['x']].id);
                   }else{
                       sendpos.push({x: item['x'], y: item['y']});
                   }
                });

                jeu[i][j]['pos_possibles'] = sendpos;
                jeu[i][j]['prises_possibles'] = prises_possibles;
            }
        }
    }
}

function checkWinNoir(){ //Vérifie l'échec et échec et mat pour l'équipe noire
    for(let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if(jeu[i][j]['team'] === "Noire" && jeu[i][j]['type'] === "Roi"){
                if(echecetmat_noir[i][j] === "Blanche"){
                    
                    let mat = true;
                    
                    if((j-1) >= 0 && (i-1) >= 0){
                        if(echecetmat_noir[i-1][j-1] === 0){
                            mat = false;
                        }
                    }

                    if((i-1) >= 0){
                        if(echecetmat_noir[i-1][j] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7 && (i-1) >= 0){
                        if(echecetmat_noir[i-1][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7){
                        if(echecetmat_noir[i][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7 && (i+1) <= 7){
                        if(echecetmat_noir[i+1][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((i+1) <= 7){
                        if(echecetmat_noir[i+1][j] === 0){
                            mat = false;
                        }
                    }

                    if((j-1) >= 0 && (i+1) <= 7){
                        if(echecetmat_noir[i+1][j-1] === 0){
                            mat = false;
                        }
                    }

                    if((j-1) >= 0){
                        if(echecetmat_noir[i][j-1] === 0){
                            mat = false;
                        }
                    }
                    
                    if(!mat){
                        console.log("Noir échec");
                        return 1;
                    }else{
                        console.log("Noir échec et mat");
                        return 2;
                    }
                }else{
                    console.log("Noire pas de victoire");
                    return 0;
                }
            }
        }
    }
}

function checkWinBlanc(){//Vérifie l'échec et échec et mat pour l'équipe blanche
    for(let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if(jeu[i][j]['team'] === "Blanche" && jeu[i][j]['type'] === "Roi"){
                if(echecetmat_blanche[i][j] === "Noire"){

                    let mat = true;

                    if((j-1) >= 0 && (i-1) >= 0){
                        if(echecetmat_blanche[i-1][j-1] === 0){
                            mat = false;
                        }
                    }

                    if((i-1) >= 0){
                        if(echecetmat_blanche[i-1][j] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7 && (i-1) >= 0){
                        if(echecetmat_blanche[i-1][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7){
                        if(echecetmat_blanche[i][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((j+1) <= 7 && (i+1) <= 7){
                        if(echecetmat_blanche[i+1][j+1] === 0){
                            mat = false;
                        }
                    }

                    if((i+1) <= 7){
                        if(echecetmat_blanche[i+1][j] === 0){
                            mat = false;
                        }
                    }

                    if((j-1) >= 0 && (i+1) <= 7){
                        if(echecetmat_blanche[i+1][j-1] === 0){
                            mat = false;
                        }
                    }

                    if((j-1) >= 0){
                        if(echecetmat_blanche[i][j-1] === 0){
                            mat = false;
                        }
                    }

                    if(!mat){
                        console.log("Blanc échec");
                        return 1;
                    }else{
                        console.log("Blanc échec et mat");
                        return 2;
                    }
                }else{
                    console.log("Blanc pas de victoire");
                    return 0;
                }
            }
        }
    }
}

io.on('connection', function(socket){
    console.log('a user connected');

    //Gestion du chat (qui n'existe pas)
    let addedUser = false;

    socket.on('new message', (data) => {
        io.emit('new message', {
            username: socket.username,
            message: data
        });
        console.log("Nouveau message: "+data);
    });

    // On reçoit un nouvel user de la part du client, on l'ajoute. Si il y a 2 utilisateurs, on peut lancer la partie en initialisant la map et on envoie le tout à tous les clients
    socket.on('add user', (username) => {
        if (addedUser) return;

        joueurs.push(username);

        socket.username = username;
        ++onlineUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: onlineUsers
        });
        io.emit('user joined', {
            username: socket.username,
            numUsers: onlineUsers
        });
        console.log("Nouveau joueur: "+username);

        if(onlineUsers === 1){
             jeu = [
                 [{team:"Noire", type:"Tour", id:1, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Cavalier", id:2, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Fou", id:3, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Roi", id:4, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Dame", id:5, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Fou", id:6, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Cavalier", id:7, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Tour", id:8, pos_possibles:[], prises_possibles:[]}],
                 [{team:"Noire", type:"Pion", id:9, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:10, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:11, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:12, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:13, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:14, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:15, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:16, pos_possibles:[], prises_possibles:[]}],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [{team:"Blanche", type:"Pion", id:17, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:18, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:19, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:20, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:21, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:22, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:23, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:24, pos_possibles:[], prises_possibles:[]}],
                 [{team:"Blanche", type:"Tour", id:25, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Cavalier", id:26, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Fou", id:27, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Roi", id:28, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Dame", id:29, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Fou", id:30, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Cavalier", id:31, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Tour", id:32, pos_possibles:[], prises_possibles:[]}]
             ];

             updateAll();

            io.emit('game start', {
                map: jeu,
                au_tour_de: joueurs[0],
                noir: joueurs[0],
                blanc: joueurs[1]
            });
        }
    });

    //Dès qu'un mouvement est effectué
    socket.on('move', (decoded) => {

        let oldpos_x;
        let oldpos_y;
        let newpos_x;
        let newpos_y;

        if(decoded['new_id'] != null){ //Prise
            for (let i = 0; i < jeu.length; i++) {
                for (let j = 0; j < jeu[i].length; j++) {
                    if(jeu[i][j] != null){
                        if(jeu[i][j]['id'] == decoded['id']){
                            oldpos_x = i;
                            oldpos_y = j;
                        }
                        if(jeu[i][j]['id'] == decoded['new_id']){
                            newpos_x = i;
                            newpos_y = j;
                        }
                    }
                }
            }

        } else { //Mouvement simple
            for (let i = 0; i < jeu.length; i++) {
                for (let j = 0; j < jeu[i].length; j++) {
                    if(jeu[i][j] != null){
                        if(jeu[i][j]['id'] == decoded['id']){
                            oldpos_x = i;
                            oldpos_y = j;
                            newpos_x = decoded['x'];
                            newpos_y = decoded['y'];
                        }
                    }
                }
            }
        }

        console.log("OLDPOSX : "+oldpos_x);
        console.log("OLDPOSY : "+oldpos_y);
        let pion = jeu[oldpos_x][oldpos_y];
        console.log(newpos_x);
        console.log(newpos_y);
        console.log(oldpos_x);
        console.log(oldpos_y);
        jeu[newpos_x][newpos_y] = jeu[oldpos_x][oldpos_y];
        jeu[oldpos_x][oldpos_y] = 0;

        let moved = pion['team'];
        let next = joueurs[0];

        if(moved === 'Blanche'){
            next = joueurs[1];
        }

        updateAll();

        console.log(echecetmat_blanche);

        console.log(jeu[newpos_x][newpos_y]);

        io.emit('map update', {
            id: jeu[newpos_x][newpos_y]['id'],
            x: newpos_x,
            y: newpos_y,
            del: decoded['new_id'],
            map: jeu,
            au_tour_de : next
        });

        //On vérifie les conditions de victoire
        switch(checkWinBlanc()){
            case 2:
                io.emit('fin', {
                    type: "echec_et_mat",
                    team: "blanc"
                });
                break;

            case 1:
                io.emit('fin', {
                    type: "echec",
                    team: "blanc"
                });
                break;
        }

        switch(checkWinNoir()){
            case 2:
                io.emit('fin', {
                    type: "echec_et_mat",
                    team: "noir"
                });
                break;

            case 1:
                io.emit('fin', {
                    type: "echec",
                    team: "noir"
                });
                break;
        }
        
    });

    //On retire l'utilisateur de la partie
    socket.on('disconnect', () => {
        if (addedUser) {
            --onlineUsers;
            joueurs.splice(joueurs.indexOf(socket.username), 1);
            io.emit('user left', {
                username: socket.username,
                numUsers: onlineUsers
            });
            console.log("Déconnexion: "+socket.username);
        }
    });
});

///							 Système de compte !!!!!!!!!!!!

// déclaration des constantes de connexion au serveur

const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'chess'
});

let app = express();

app.set('view engine', 'ejs');

// Fichiers statiques
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));
app.use('/icon-fonts', express.static('icon-fonts'));
app.use('/css', express.static('css'));
app.use('../style', express.static('style'));
app.use('../lib', express.static('lib'));
app.use('../script', express.static('script'));


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

connection.query( 'CREATE TABLE IF NOT EXISTS `users` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT,`name` varchar(255) DEFAULT NULL,`pswd` varchar(255) DEFAULT NULL,PRIMARY KEY (`id`),UNIQUE KEY `name` (`name`)) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8');

// page de connexion
app.get('/', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.render('login');
	}
});

// page d'inscription

app.get('/signup', function(request, response) {
	if (request.session.loggedin) {
		response.redirect('/home');
	} else {
		response.render('signup');
	}
});

// inscription

app.post('/inscr', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	connection.query('SELECT * FROM users WHERE name = ?', [username], function(error, results, fields) {
		if (results.length == 1) {
			response.redirect('/signup');
			response.end();
		}
	});
	if (username && password) {
		connection.query('INSERT INTO users (name, pswd) VALUES (?, MD5(?))', [username, password], function(error, results, fields) {
			response.redirect('/')	
			response.end();
		});
	} else {
		response.redirect('/signup')
		response.end();
	}
});

// authentification

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM users WHERE name = ? AND pswd = MD5(?)', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
				response.end();
			} else {
				response.redirect('/')
				response.end();
			}			
			response.end();
		});
	} else {
		response.redirect('/')
		response.end();
	}
});

// page connecté

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		let tagline = request.session.username;
		response.render('home',{
			tagline : tagline
		});
	} else {
		response.redirect('/')
	}

});

// Déconnexion

app.get('/logout', function(request, response) {
	if (request.session.loggedin) {
		request.session.destroy();
		response.redirect('/')
	} else {
		response.redirect('/')
	}

});

// Jeu

app.get('/play', function(request, response) {
	if (request.session.loggedin) {
		let pseudo = request.session.username;
		response.redirect("http://10.8.0.2:5500/");
	} else {
		response.render('signup');
	}
});

app.listen(5050);