var infoGui = new BABYLON.GUI.TextBlock();
window.addEventListener('DOMContentLoaded', function() {
    let divFps = document.getElementById("fps");
    let canvas = document.getElementById('renderCanvas');
    let assetsFolder = "./model/";
    let engine = new BABYLON.Engine(canvas, true, { stencil: true });
    let createScene = function() {
        let scene = new BABYLON.Scene(engine);
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
        light.intensity = 1.3;

        // GUI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        infoGui.text = "Bienvenue sur le jeu d'échec MINION";
        infoGui.color = "white";
        infoGui.fontFamily = "Josefin Sans";
        infoGui.textVerticalAlignment = 0;
        infoGui.paddingTop = 20;
        infoGui.fontSize = 30;
        advancedTexture.addControl(infoGui);


        // Génération du sol 8x8 noir et blanc
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



        placeAllMeshes(hugoBoard, scene);

        createSphereArray(scene);


        //Events
        var startingPoint;
        var currentMesh;

        var getGroundPosition = function () {
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
            
            //Si on a la souris sur un mesh
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== tiledGround; });
            if (pickInfo.hit && !fin) {
                currentMesh = pickInfo.pickedMesh;

                if(currentMesh.visibility == true && myTurn){
                    if(isBlack){
                        if(currentMesh.name.includes("T2")){ //Click pion allié
                            removePossiblePos();
                            showPosForUser(currentMesh.id, hl);
                            removeAllHighlight(meshesArray, hl);
                            hl.addMesh(currentMesh, BABYLON.Color3.Green());
                            currentMeshSelected = currentMesh;
                            return;
                        }
                        if(currentMesh.name.length == 2){ //Click position
                            if(currentMeshSelected != null){
                                currentMeshSelected.setAbsolutePosition(getAbsolutePositionOnBoard(boardPosition,currentMesh.name.charAt(1),currentMesh.name.charAt(0)));
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                moveToServer(currentMeshSelected.id, currentMesh.name.charAt(1), currentMesh.name.charAt(0));
                            }
                            return;
                        }
                        if(currentMesh.name.includes("T1")){ //Click pion ennemi
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
                        if(currentMesh.name.includes("T1")){ //Click pion allié
                            showPosForUser(currentMesh.id, hl);
                            removeAllHighlight(meshesArray, hl);
                            hl.addMesh(currentMesh, BABYLON.Color3.Green());
                            currentMeshSelected = currentMesh;
                            return;
                        }
                        if(currentMesh.name.length == 2){ //Click position
                            if(currentMeshSelected != null){
                                currentMeshSelected.setAbsolutePosition(getAbsolutePositionOnBoard(boardPosition,currentMesh.name.charAt(1),currentMesh.name.charAt(0)));
                                removeAllHighlight(meshesArray, hl);
                                removePossiblePos();
    
                                moveToServer(currentMeshSelected.id, currentMesh.name.charAt(1), currentMesh.name.charAt(0));
                            }
                            return;
                        }
    
                        if(currentMesh.name.includes("T2")){ //Click pion ennemi
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
            }
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
            startingPoint = current;
    
        }

        //Evenements
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
        //divFps.innerHTML = engine.getFps().toFixed() + " fps";
        scene.render();
    });


    window.addEventListener('resize', function() {
        engine.resize();
    });
});