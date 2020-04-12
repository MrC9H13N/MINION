//Génération coordonées des points
let boardPosition = baseCoord(-2.625);

window.addEventListener('DOMContentLoaded', function() {
    let divFps = document.getElementById("fps");
    let canvas = document.getElementById('renderCanvas');
    let assetsFolder = "./model/";
    let engine = new BABYLON.Engine(canvas, true, { stencil: true });
    let createScene = function() {
        let scene = new BABYLON.Scene(engine);
        //scene.clearColor = new BABYLON.Color3(0.3,0.3,0.3);
        var hl = new BABYLON.HighlightLayer("hl1", scene);
        hl2 = new BABYLON.HighlightLayer("hl2", scene);

        //ArcRotateCamera
        let camera = new BABYLON.ArcRotateCamera("Camera", 0, 10, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.setPosition(new BABYLON.Vector3(7, 7, 9));
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 50;
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.80;

        //Antialiasing
        let postProcess = new BABYLON.FxaaPostProcess("fxaa", 2.0, camera);

        //Light
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(2, 1, 0), scene);
        light.intensity = 1.5;


        // Ground
        var grid = {
            'h' : 8,
            'w' : 8
        };

        var prec = {
            'h' : 1,
            'w' : 1
        }
        var tiledGround = new BABYLON.MeshBuilder.CreateTiledGround("Tiled Ground", {xmin: -3, zmin: -3, xmax: 3, zmax: 3, subdivisions: grid, precision : prec}, scene);
        tiledGround.position = new BABYLON.Vector3(0,-0.41,0);

        let groundSubMeshes = new Array(8);
        for (var i = 0; i < groundSubMeshes.length; i++) {
            groundSubMeshes[i] = new Array(8);
        }

        var whiteMaterial = new BABYLON.StandardMaterial("Green", scene);
        whiteMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        var blackMaterial = new BABYLON.StandardMaterial("Black", scene);
        blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        var multimat = new BABYLON.MultiMaterial("multi", scene);
        multimat.subMaterials.push(whiteMaterial);
        multimat.subMaterials.push(blackMaterial);
        tiledGround.material = multimat;
        var verticesCount = tiledGround.getTotalVertices();
        var tileIndicesLength = tiledGround.getIndices().length / (grid.w * grid.h);
        tiledGround.subMeshes = [];
        var base = 0;

        for (var row = 0; row < grid.h; row++) {
            
            for (var col = 0; col < grid.w; col++) {
                let temp = new BABYLON.SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, tiledGround);
                tiledGround.subMeshes.push(temp);
                groundSubMeshes[row][col] = temp;
                base += tileIndicesLength;  
            }
        }
        //console.log(groundSubMeshes[2][2]._renderingMesh);
        //groundSubMeshes[2][2]._renderingMesh.forEach(m => hl.addMesh(m, BABYLON.Color3.Green()));
        //hl.addMesh(groundSubMeshes[2][2]._renderingMesh, BABYLON.Color3.Green());
        


        //AssetsManager
        /*let assetsManager = new BABYLON.AssetsManager(scene);
        let meshTask2 = assetsManager.addMeshTask("fzef", "", assetsFolder, "T1-Pawn.glb");
        //let meshTask1 = assetsManager.addMeshTask("fzef", "", assetsFolder, "T1-Pawn.glb");
        meshTask2.onSuccess = function (task) {
            
            task.loadedMeshes[0].scaling = getScale(1.6);

            task.loadedMeshes[0].rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
            task.loadedMeshes[0].position = getPositionOnBoard(boardPosition,3,4); //3/8

            newMeshes[0].scaling = getScale(10);
                
            
        }*/



        placeAllMeshes(hugoBoard, scene);




        /*var material = new BABYLON.StandardMaterial(scene);
        material.alpha = 1;
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 30, 0.2, scene);
        sphere.scaling = getScale(1.6);
        sphere.position = new BABYLON.Vector3(3-0.375,-0.42,3-0.375);
        //sphere.visibility = true;
        sphere.material = material; // <--*/
        createSphereArray(scene);
        //showPossiblePos(arr);
        

        /*BABYLON.SceneLoader.ImportMesh("", assetsFolder,"T1-Pawn.glb", scene, function(newMeshes) {
            var hl = new BABYLON.HighlightLayer("hl1", scene);
            newMeshes[0].scaling = getScale(10);
            newMeshes.forEach(m => hl.addMesh(m, BABYLON.Color3.Green()));
            console.log(newMeshes);
            hl.outerGlow = false;
            hl.innerGlow = false;
        });*/

        /*meshTask1.onSuccess = function (task) {

            //task.loadedMeshes[0].scaling = getScale(2);
            //task.loadedMeshes[0].setPositionWithLocalVector(new BABYLON.Vector3(3, 0.26, 3));
        }*/

        //assetsManager.load();

        //Events
        var startingPoint;
        var currentMesh;

        var getGroundPosition = function () {
            // Use a predicate to get position on the ground
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == tiledGround; });
            if (pickinfo.hit) {
                return pickinfo.pickedPoint;
            }

            return null;
        }

        var onPointerDown = function (evt) {
            if (evt.button !== 0) {
                return;
            }
            
            // check if we are under a mesh
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== tiledGround; });
            if (pickInfo.hit) {
                currentMesh = pickInfo.pickedMesh;

                if(currentMesh.visibility == true && myTurn){
                    if(isBlack){
                        if(currentMesh.name.includes("T2")){
                            removePossiblePos();
                            console.log(currentMesh);
                            showPosForUser(currentMesh.id, hl);
                            console.log("Click pion détecté");
                            removeAllHighlight(meshesArray, hl);
                            hl.addMesh(currentMesh, BABYLON.Color3.Green());
                            currentMeshSelected = currentMesh;
                            return;
                        }
                        if(currentMesh.name.length == 2){
                            console.log("Click pos détecté");
                            if(currentMeshSelected != null){
                                currentMeshSelected.setAbsolutePosition(getAbsolutePositionOnBoard(boardPosition,currentMesh.name.charAt(1),currentMesh.name.charAt(0)));
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                moveToServer(currentMeshSelected.id, currentMesh.name.charAt(1), currentMesh.name.charAt(0));
                            }
                            return;
                        }
                        if(currentMesh.name.includes("T1")){
                            console.log("Click pion ennemi détecté");
                            if(currentMeshSelected != null && currentMesh.isHighlighted){
                                currentMesh.dispose();
                                currentMeshSelected.setAbsolutePosition(currentMesh.absolutePosition);
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                getToServer(currentMeshSelected.id, currentMesh.id);
                            }
                            return;
                        }
                    } else {
                        if(currentMesh.name.includes("T1")){
                            console.log(currentMesh);
                            showPosForUser(currentMesh.id, hl);
                            console.log("Click pion détecté");
                            removeAllHighlight(meshesArray, hl);
                            hl.addMesh(currentMesh, BABYLON.Color3.Green());
                            currentMeshSelected = currentMesh;
                            return;
                        }
                        if(currentMesh.name.length == 2){
                            console.log("Click pos détecté");
                            if(currentMeshSelected != null){
                                currentMeshSelected.setAbsolutePosition(getAbsolutePositionOnBoard(boardPosition,currentMesh.name.charAt(1),currentMesh.name.charAt(0)));
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                moveToServer(currentMeshSelected.id, currentMesh.name.charAt(1), currentMesh.name.charAt(0));
                            }
                            return;
                        }
    
                        if(currentMesh.name.includes("T2")){
                            console.log("Click pion ennemi détecté");
                            if(currentMeshSelected != null && currentMesh.isHighlighted){
                                currentMesh.dispose();
                                currentMeshSelected.setAbsolutePosition(currentMesh.absolutePosition);
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                getToServer(currentMeshSelected.id, currentMesh.id);
                            }
                            return;
                        }
                    }
                    
                }
            }            //FIN TESTS
        }

        var onPointerUp = function () {
            if (startingPoint) {
                camera.attachControl(canvas, true);
                startingPoint = null;
                return;
            }
        }

        var onPointerMove = function (evt) {
            if (!startingPoint) {
                return;
            }
    
            var current = getGroundPosition(evt);
    
            if (!current) {
                return;
            }
    
            var diff = current.subtract(startingPoint);
            
            closestPositionOnBoard(boardPosition, current.x, current.z);
            currentMesh.position.addInPlace(new BABYLON.Vector3(diff.x*0.625,diff.y*0.625,diff.z*0.625));
            /*let toBeMoved = closestPositionOnBoard(boardPosition, current.x, current.z);
            currentMesh.position.addInPlace(toBeMoved);*/
            //console.log(current);
            startingPoint = current;
    
        }

        canvas.addEventListener("pointerdown", onPointerDown, false);
        canvas.addEventListener("pointerup", onPointerUp, false);


        scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);

    }

        return scene;
    }
    

    
    let scene = createScene();


    engine.runRenderLoop(function() {
        divFps.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();
    });


    window.addEventListener('resize', function() {
        engine.resize();
    });
});