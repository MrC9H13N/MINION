function getScale(val){
    return new BABYLON.Vector3(val, val, val);
}

function getRdnId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

let sphereMeshes = new Array(8);
for (var i = 0; i < sphereMeshes.length; i++) {
    sphereMeshes[i] = new Array(8);
}

function createSphereArray(scene){
    for (let i = 0; i < sphereMeshes.length; i++) {
        for (let j = 0; j < sphereMeshes[i].length; j++) {
            var material = new BABYLON.StandardMaterial(scene);
            material.alpha = 1;
            material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            let name = String(i)+String(j);
            var sphere = BABYLON.Mesh.CreateSphere(name, 30, 0.2, scene);
            sphere.scaling = getScale(0.8);
            sphere.position = new BABYLON.Vector3(-2.625+i*0.75,-0.45,-2.625+j*0.75);
            sphere.material = material; 
            sphere.visibility = false;
            sphereMeshes[i][j] = sphere;
        }
    }
}

function showPossiblePos(arr){
    arr.forEach(pos => {
        sphereMeshes[pos.x][pos.y].visibility = true;
    });
}

function removePossiblePos(){
    console.log(sphereMeshes);
    sphereMeshes.forEach(arr => {
        arr.forEach(el => {
            el.visibility = false;
        });
    });
}

var hl2;
function showPossibleGetPos(arr, hl){
    console.log(meshesArray);
    arr.forEach(id => {
        for (let i = 0; i < meshesArray.length; i++) {
            for (let j = 0; j < meshesArray[i].length; j++) {
                if(meshesArray[i][j] != null){
                    if(meshesArray[i][j][1].id == id){
                        console.log(meshesArray[i][j]);
                        meshesArray[i][j].forEach(m => hl2.addMesh(m, BABYLON.Color3.Red()));
                        meshesArray[i][j][1].isHighlighted = true;
                    } 
                }
            }
        }
    });
}

function showPosForUser(id,hl){
    console.log("HUGOBOARD");
    console.log(hugoBoard);
    for (let i = 0; i < hugoBoard.length; i++) {
        for (let j = 0; j < hugoBoard[i].length; j++) {
            if(hugoBoard[i][j] != null){
                if(hugoBoard[i][j].id == id){
                    showPossiblePos(hugoBoard[i][j].pos_possibles);
                    console.log(hugoBoard[i][j].pos_possibles);
                    console.log(hugoBoard[i][j].prises_possibles);
                    showPossibleGetPos(hugoBoard[i][j].prises_possibles, hl);
                }
            }
        }
    }
}

function baseCoord(val){
    arr = []
    while(arr.length < 8){
        tempArr = []
        for(let i = 0 ; i < 8 ; i++){
            tempArr[i] = {x:val+0.75*i,z:-2.25+0.75*arr.length}
        } 
        arr[arr.length] = tempArr;
    }
    console.log(arr);
    return arr;
}

function getPositionOnBoard(arr,x,z){
    return new BABYLON.Vector3(arr[x][z].x, 0, arr[x][z].z);
}

function getAbsolutePositionOnBoard(arr,x,z){
    return new BABYLON.Vector3(arr[x][z].x, -0.41, arr[x][z].z-0.375);
}

function getAbsolutePositionOnBoardEnnemy(arr,x,z,isBlack){
    if(!isBlack){
        return new BABYLON.Vector3(arr[x][z].x, 0, arr[x][z].z);
    }
    return new BABYLON.Vector3(arr[x][z].x, 0, arr[x][z].z-0.75);
}


function closestPositionOnBoard(arr, x, z){

    let delta = Number.MAX_SAFE_INTEGER;
    let closest = {
        x:0,
        z:0
    }
    arr.forEach(first => {
        first.forEach(second => {
            let tempDelta = Math.abs(x - second.x) + Math.abs(z - second.z);
            if(tempDelta < delta){
                delta = tempDelta;
                closest.x = second.x;
                closest.z = second.z;
            } 
        });
    });
    console.log(closest.x +" / " + closest.z);
    return new BABYLON.Vector3(closest.x*0.625, 0, closest.z*0.625);
}

function placeAllMeshes(firstArr, scene){
    console.log(boardPosition);
    for (let i = 0; i < firstArr.length; i++) {
        for (let j = 0; j < firstArr[i].length; j++) {
            let team = "T1-";
            let type;
            if(firstArr[i][j]['team'] == "Blanche") team = "T2-";
            if(firstArr[i][j]['type'] == "Pion") type = "Pawn.glb";
            if(firstArr[i][j]['type'] == "Tour") type = "Castle.glb";
            if(firstArr[i][j]['type'] == "Cavalier") type = "Knight.glb";
            if(firstArr[i][j]['type'] == "Fou") type = "Bishop.glb";
            if(firstArr[i][j]['type'] == "Roi") type = "King.glb";
            if(firstArr[i][j]['type'] == "Dame") type = "Queen.glb";
            let fileName = team + type;
            //console.log(fileName + " ["+i+"/"+j+"]") ;

            if(!fileName.includes("undefined")){
                BABYLON.SceneLoader.ImportMesh("", "./model/new/",fileName, scene, function(newMeshes) {
                    newMeshes[0].scaling = getScale(1.6);
                    newMeshes[1].name = fileName;
                    newMeshes[1].id = hugoBoard[i][j].id;
                    newMeshes[1].isHighlighted = false;
                    newMeshes[0].position = getPositionOnBoard(boardPosition,i,j);
                    if(fileName.includes("1")) newMeshes[0].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Axis.Y);
                    if(fileName.includes("1")) newMeshes[0].translate(BABYLON.Axis.Z, -0.75, BABYLON.Space.WORLD);
                    meshesArray[i][j] = newMeshes;
                });
            }
        }
    }
}

function removeAllHighlight(meshesArray, hl){
    for (let i = 0; i < meshesArray.length; i++) {
        for (let j = 0; j < meshesArray[i].length; j++) {
            if(meshesArray[i][j] != null){
                meshesArray[i][j].forEach(m => hl.removeMesh(m));
            }
        }
    }
}

let meshesArray = new Array(8);
for (var i = 0; i < meshesArray.length; i++) {
    meshesArray[i] = new Array(8);
}

let hugoBoard = [
    [{team:"Noire", type:"Tour", id:1, pos_possibles:[], prises_possibles:[17,25]}, {team:"Noire", type:"Cavalier", id:2, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Fou", id:3, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Roi", id:4, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Dame", id:5, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Fou", id:6, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Cavalier", id:7, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Tour", id:8, pos_possibles:[], prises_possibles:[]}],
    [{team:"Noire", type:"Pion", id:9, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:10, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:11, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:12, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:13, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:14, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:15, pos_possibles:[], prises_possibles:[]}, {team:"Noire", type:"Pion", id:16, pos_possibles:[], prises_possibles:[]}],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [{team:"Blanche", type:"Pion", id:17, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:18, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:19, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:20, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:21, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:22, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:23, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Pion", id:24, pos_possibles:[], prises_possibles:[]}],
    [{team:"Blanche", type:"Tour", id:25, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Cavalier", id:26, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Fou", id:27, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Roi", id:28, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Dame", id:29, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Fou", id:30, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Cavalier", id:31, pos_possibles:[], prises_possibles:[]}, {team:"Blanche", type:"Tour", id:32, pos_possibles:[], prises_possibles:[]}]
];

var currentMeshSelected;