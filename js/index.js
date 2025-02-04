document.addEventListener('DOMContentLoaded', ()=>{

    const board = document.getElementById('board')
    
    var cells;
    var matrix =[];              
    let row, col;
    let sourcecordinate, targetcordinate;


    renderboard();
    
    function renderboard(cellwidth = 22) {

        const root = document.documentElement;
        root.style.setProperty('--cell-width',  `${cellwidth}px`);    
        
        board.innerHTML = ' ';

        row = Math.floor(board.clientHeight/ cellwidth);
        col = Math.floor(board.clientWidth / cellwidth);

        cells=[];
        matrix = [];

        for(let i=0; i<row; i++){
            const rowarr = [];

            const rowelement = document.createElement('div');
            rowelement.classList.add('row');
            rowelement.setAttribute('id', `${i}`);
        

            for(let j=0; j<col; j++){
                const colelement = document.createElement('div');
                colelement.classList.add('col');
                colelement.setAttribute('id', `${i}-${j}`);
        
                cells.push(colelement)
                rowarr.push(colelement);
                rowelement.appendChild(colelement);
            }
            matrix.push(rowarr);
            board.appendChild(rowelement);
        }

        sourcecordinate = set('source');
        targetcordinate = set('target');

        boardinteraction(cells);
        

    }


    // Selecting NavOptions and DropOptions
                   

    const navoptions = document.querySelectorAll('.nav-menu>li>a');
    var dropoptions = null;

    const removeactive = (elements, parent = false)=>{

        elements.forEach(element =>{
            if(parent){
                element = element.parentElement;
            }
            element.classList.remove('active');
        })
    }

    navoptions.forEach(navoption =>{
        navoption.addEventListener('click', ()=>{
            const li = navoption.parentElement;

            if(li.classList.contains('active')){      //Toggle Feature
                li.classList.remove('active');
                return;
            }

            removeactive(navoptions, true);
            li.classList.add('active');

            if(li.classList.contains('drop-box')){
                dropoptions = li.querySelectorAll('.drop-menu>li');
                
                toggle_dropoptions(navoption.innerText);
            }
        })
    })



    let pixelsize = 22;
    let algorithm = 'BSF';

    let button = document.querySelector('.btn');

    function toggle_dropoptions(target){
        

        dropoptions.forEach(dropoption =>{
            dropoption.addEventListener('click', ()=>{
                removeactive(dropoptions);

                dropoption.classList.add('active');

                if (target === 'Pixel') {
                    pixelsize = +dropoption.innerText.replace('px', ' ');
                    
                    renderboard(pixelsize);
                }
                else{
                    algorithm = dropoption.innerText.split(' ')[0];
                    button.innerText = `Visualize ${algorithm}`;
                }

                removeactive(navoptions, true);
            })
        })
    }

    document.addEventListener('click', (e)=>{
        const navmenu = document.querySelector('.nav-menu');

        if(!navmenu.contains(e.target)){
            removeactive(navoptions, true);
        }
    })


    //=======================================================================================================================================================================================================
    //======================================================================================  BOARD INTERACTION  ===========================================================================================//
    //=======================================================================================================================================================================================================
    
    
    
    function isvalid(x, y){
        return (x>=0 && y>=0 && x<row && y<col);

        
    }

    function set(classname, x = -1, y = -1){
        if(isvalid(x,y)){
            matrix[x][y].classList.add(classname);
        }
        else{
            x = Math.floor(Math.random() * row);
            y = Math.floor(Math.random() * col);
            matrix[x][y].classList.add(classname);
        }

        return {x,y};
    } 


    let isdrawing = false;
    let isdragging = false; 
    let dragpoint = null;

    function boardinteraction(cells){

        cells.forEach((cell) =>{

            const pointerdown = (e)=>{
                if(e.target.classList.contains('source')){
                    dragpoint = 'source';
                    isdragging = true;
    
                }
                else if(e.target.classList.contains('target')){
                    dragpoint ='target';
                    isdragging = true;
                }
                else{
    
                    isdrawing = true;
                }
            }
    
            const pointermove = (e)=>{
                
                if(isdrawing){
                    
                    e.target.classList.add('wall');
                }
                else if(dragpoint && isdragging){

                    cells.forEach(cell=>{
                        cell.classList.remove(`${dragpoint}`);
                    })

    
    
                    
                    e.target.classList.add(`${dragpoint}`);
                    cordinate = e.target.id.split('-');              //array
    
                    if(dragpoint === 'source'){
                        sourcecordinate.x = +cordinate[0];
                        sourcecordinate.y = +cordinate[1];
                    }else{
                        targetcordinate.x = +cordinate[0];
                        targetcordinate.y = +cordinate[1];
                    }
                    
                }
            }
    
            const pointerup = ()=>{
                isdragging = false;
                isdrawing = false;
                dragpoint = null;
            }
    
            cell.addEventListener('pointerdown', pointerdown);
            cell.addEventListener('pointermove', pointermove);
            cell.addEventListener('pointerup', pointerup);
            
            cell.addEventListener('click', ()=>{
                cell.classList.toggle('wall');
            })
        })

    }
    


    const clearpathbtn = document.getElementById('clearPath');
    clearpathbtn.addEventListener('click', ()=>{
        clearpath();
    })

    const clearpath = ()=>{
        cells.forEach(cell =>{
            cell.classList.remove('path');
            cell.classList.remove('visited')
        })
    }



    const clearboardbtn = document.getElementById('clearBoard');
    clearboardbtn.addEventListener('click', ()=>{
        clearboard();
    })

    const clearboard = ()=>{
        cells.forEach(cell =>{
            cell.classList.remove('visited');
            cell.classList.remove('wall');
            cell.classList.remove('path');
        })
    }


    //=======================================================================================================================================================================================================
    //===============================================================================  MAZE GENERATION ALGORITHM  ==========================================================================================//
    //=======================================================================================================================================================================================================


    var walltoAnimate;

    const GenerateMazebtn = document.getElementById('GenerateMazebtn');
    GenerateMazebtn.addEventListener('click', ()=>{
        walltoAnimate = [];
        generateMaze(0, row-1, 0, col-1, false, 'horizontal');
        animate(walltoAnimate, 'wall');
    })
    
    function generateMaze(rowstart, rowend, colstart, colend, surroundingwall, orientation){

        if(rowstart > rowend || colstart > colend){
            return; 
        }

        if(!surroundingwall){

            for(let i =0; i< col; i++){
                if(!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target')){
                    walltoAnimate.push(matrix[0][i]);
                }
                if(!matrix[row-1][i].classList.contains('source') && !matrix[row-1][i].classList.contains('target')){
                    walltoAnimate.push(matrix[row-1][i]);
                }
                
            }

            for(let i=0; i<row; i++){
                if(!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target')){
                    walltoAnimate.push(matrix[i][0]);
         
                }
                if(!matrix[i][col-1].classList.contains('source')&& !matrix[i][col-1].classList.contains('target')){
                    walltoAnimate.push(matrix[i][col-1]);
                }
            }

            surroundingwall = true;
        }

        if(orientation === 'horizontal'){
            let possiblerows =[]; 
            for(let i= rowstart; i<= rowend; i+=2){
                possiblerows.push(i);
            }

            let possiblecols =[];
            for(let i = colstart - 1; i <= colend + 1; i+=2){

                if(i > 0 && i < col-1){
                    possiblecols.push(i);
                }
            }

            const currrow = possiblerows[Math.floor(Math.random() * possiblerows.length)];
            const randomcol = possiblecols[Math.floor(Math.random() * possiblecols.length)];

            for(let i = colstart - 1; i <= colend + 1; i++){
                const cell = matrix[currrow][i];

                if(!cell || i === randomcol || cell.classList.contains('source') || cell.classList.contains('target')){
                    continue;
                }
                 
                walltoAnimate.push(cell);
            }

            //Upper Subdivision
            generateMaze(rowstart, currrow - 2, colstart, colend, surroundingwall, ((currrow-2) - rowstart > colend - colstart)? 'horizontal' : 'vertical');

            //Bottom Subdivision
            generateMaze(currrow +   2, rowend, colstart, colend, surroundingwall, (rowend - (currrow + 2) > colend - colstart)? 'horizontal' : 'vertical');
        }

        else{

            let possiblecols =[];
            for(let i = colstart; i<= colend; i+=2){
                possiblecols.push(i);
            }

            let possiblerows = [];
            for(let i = rowstart-1; i<= rowend+1; i+=2){
                
                if(i>0 && i< row-1){
                    possiblerows.push(i);
                }
            }

            const currcol = possiblecols[Math.floor(Math.random() * possiblecols.length)];
            const randomrow = possiblerows[Math.floor(Math.random() * possiblerows.length)];

            for(let i = rowstart -1; i<= rowend+1 ; i++){
                if(!matrix[i]){
                    continue;
                }
                const cell = matrix[i][currcol];

                if(i === randomrow || cell.classList.contains('source') || cell.classList.contains('target')){
                    continue;
                }

                walltoAnimate.push(cell);
            }

            //Left Subdivision
            
            generateMaze(rowstart, rowend, colstart, currcol-2, surroundingwall, (rowend - rowstart > (currcol-2) - colstart)? 'horizontal' : 'vertical');
            
            //Right Subdivision
            generateMaze(rowstart, rowend, currcol+2, colend, surroundingwall, (rowend - rowstart > colend - (currcol+2))? 'horizontal' : 'vertical');
                
        }
    }


    //=======================================================================================================================================================================================================
    //=================================================================================== BFS (Path Finding Algo) ============================================================================================
    //=======================================================================================================================================================================================================


    const Visualizebtn = document.querySelector('#Visualize');

    var visitedcell;
    var pathtoAnimate;

    Visualizebtn.addEventListener('click', ()=>{
        clearpath();
        visitedcell = [];
        pathtoAnimate = [];

        switch (algorithm) {
            case 'BFS':
                BSF();
                break;
            
            case "Dijkstra's":
                Dijsktra();
                break; 

            case 'Greedy':
                Greedy();
                break; 
            default:
                break;
        }

        animate(visitedcell, 'visited');
    })

    
    function BSF(){
        const queue = [];
        const visited = new Set();
        const parent = new Map();

        queue.push(sourcecordinate);
        
        visited.add(`${sourcecordinate.x}-${sourcecordinate.y}`);


        while (queue.length > 0) {
            const current = queue.shift();
            
            visitedcell.push(matrix[current.x][current.y]);
            

            //Target Found
            if(current.x === targetcordinate.x && current.y === targetcordinate.y){
                getpath(parent, targetcordinate);
                return;
            }

            const neighbours =[
                {x: current.x - 1, y: current.y}, 
                {x: current.x, y: current.y + 1},   
                {x: current.x + 1, y: current.y}, 
                {x: current.x, y: current.y - 1}    
            ];

            for(const negighbour of neighbours){
                const key = `${negighbour.x}-${negighbour.y}`;
                
                if(isvalid(negighbour.x, negighbour.y) && !visited.has(key)  && !matrix[negighbour.x][negighbour.y].classList.contains('wall')){
                    queue.push(negighbour);
                    visited.add(key);
                    parent.set(key, current);  
                }
            }

        }

    }


    function animate(elements, classname){
        let delay = 10;
        if (classname === 'path') {
            delay *= 3.5;
        }

        for(let i=0; i<elements.length; i++){
            setTimeout(() =>{
                elements[i].classList.remove('visited');

                elements[i].classList.add(classname);
                if(i === elements.length-1 && classname === 'visited'){
                    
                    animate(pathtoAnimate, 'path');
                }
            }, delay *i);
        }
    }


    function getpath(parent, target){
        
        if(!target){
            return;
        }

        pathtoAnimate.push(matrix[target.x][target.y]);
        const p = parent.get(`${target.x}-${target.y}`);
        getpath(parent, p);
    }

    //=======================================================================================================================================================================================================
    //==================================================================================  DIJSKTR'A ALGORITHM  =========================================================================================
    //=======================================================================================================================================================================================================
    
    
    
    //Priority Queue

    class PriorityQueue{
        constructor(){
            this.elements = [];
            this.length = 0;
        }

        push(data){
            this.elements.push(data);
            this.length++;
            this.upheapify(this.length-1);
        }

        pop(){
            this.swap(0, this.length-1);
            const popped = this.elements.pop();
            this.length--;
            this.downheapify(0);
            return popped;
        }

        upheapify(i){
            if(i===0){
                return;
            }

            const parent = Math.floor((i-1)/2);

            if(this.elements[i].cost < this.elements[parent].cost){
                this.swap(i, parent);
                this.upheapify(parent);
            }
        }

        downheapify(i){

            let minnode = i;

            const leftchild = (2*i)+1;
            const rightchild = (2*i)+2;

            if (leftchild < this.length && this.elements[leftchild].cost < this.elements[minnode].cost) {
                minnode = leftchild;
            }

            if ( rightchild < this.length && this.elements[rightchild].cost < this.elements[minnode].cost) {
                minnode = rightchild;
            }

            if (minnode !== i) {
                this.swap(minnode, i);
                this.downheapify(minnode);
            }
             
        }

        isempty(){
            return this.length === 0;
        }

        swap(x, y){
            [this.elements[x], this.elements[y]] = [this.elements[y], this.elements[x]];
        }
    }


    function Dijsktra(){
        const pq = new PriorityQueue();
        const parent = new Map();
        const distance = [];

        for(let i =0; i< row; i++){
            const INF =[]
            for(let j =0; j< col; j++){
                INF.push(Infinity);
            }
            distance.push(INF);
        }

        distance[sourcecordinate.x][sourcecordinate.y] = 0;
        pq.push({cordinate: sourcecordinate, cost: 0 });
        

        while (!pq.isempty()) {
            const {cordinate: current, cost: distancesofar} = pq.pop();
            console.log(current.y);
            
            console.log(visitedcell);
            visitedcell.push(matrix[current.x][current.y]);
            

            if(current.x === targetcordinate.x && current.y === targetcordinate.y){
                getpath(parent, targetcordinate);
                return;
            }

            const neighbours =[
                {x: current.x - 1, y: current.y},
                {x: current.x, y: current.y + 1}, 
                {x: current.x + 1, y: current.y},  
                {x: current.x, y: current.y - 1}    
            ];

            for(const negighbour of neighbours){
                const key = `${negighbour.x}-${negighbour.y}`;
                
                if(isvalid(negighbour.x, negighbour.y) && !matrix[negighbour.x][negighbour.y].classList.contains('wall')){


                    //Assuming edge weight is 1 between adjacent nodes
                    const edgeweight = 1;
                    const distancetoneighbour = distancesofar + edgeweight;

                    if(distancetoneighbour < distance[negighbour.x][negighbour.y]){

                        distance[negighbour.x][negighbour.y] = distancetoneighbour;
                        pq.push({cordinate: negighbour, cost: distancetoneighbour});
                        parent.set(key, current);  
                    }
                    
                }
            }

        }

    }


    //=======================================================================================================================================================================================================
    //==================================================================================  GREEDY ALGO  =======================================================================================================
    //=======================================================================================================================================================================================================
    
    
    
    
    function heuristicValue(node){
        //return dx + dy
        return Math.abs(node.x - targetcordinate.x) + Math.abs(node.y - targetcordinate.y)
    }

    function Greedy(){
        const queue = new PriorityQueue();
        const visited = new Set();
        const parent = new Map();

        queue.push({cordinate: sourcecordinate, cost: heuristicValue(sourcecordinate)});
        visited.add(`${sourcecordinate.x}-${sourcecordinate.y}`);


        while (queue.length > 0) {
            const {cordinate: current} = queue.pop();
            
            visitedcell.push(matrix[current.x][current.y]);
            

            
            if(current.x === targetcordinate.x && current.y === targetcordinate.y){
                getpath(parent, targetcordinate);
                return;
            }

            const neighbours =[
                {x: current.x - 1, y: current.y},   
                {x: current.x, y: current.y + 1}, 
                {x: current.x + 1, y: current.y},   
                {x: current.x, y: current.y - 1}  
            ];

            for(const negighbour of neighbours){
                const key = `${negighbour.x}-${negighbour.y}`;
                
                if(isvalid(negighbour.x, negighbour.y) && !visited.has(key)  && !matrix[negighbour.x][negighbour.y].classList.contains('wall')){
                    queue.push({cordinate: negighbour, cost: heuristicValue(negighbour)});
                    visited.add(key);
                    parent.set(key, current);  
                }
            }

        }

    }



})
