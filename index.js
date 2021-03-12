'use strict';

const level = 2;

/*fetch(`http://51.15.207.127:13337/${level}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify([])
})
.then(response => response.json())
.then(response => console.log(response));*/

function testInitGrid(grid) {
    for(let i = 1; i < grid.lenght - 1; i++) {
        if(grid[i].x === grid[i].y || grid[i].x === grid[i].z || grid[i].z === grid[i].y) {
            return false;
        }
    }
    return true;
}

function initGrid() {
    const grid = [
        {x: 0, y: 0, z: 0, value: 0},
    ];
    const vectors = ['x', 'y', 'z'];
    //формируем массив с координатами ячеек
    for(let i = 1; i < level; i++) {
        let numb = -i; 
        for(let j = 0; j < i*6; j++) {        
            const newCell = {}
            for(let k = 0; k < 3; k++) {
                newCell[vectors[k]] = numb + k;
            }            
            if(j % 2 !== 0) {
                [vectors[1], vectors[2]] = [vectors[2], vectors[1]]
            } else {
                [vectors[0], vectors[1]] = [vectors[1], vectors[0]];
            }
            newCell.value = 0;
            grid.push(newCell);
        }
    }
    //Выравниваем объекты в массиве по единообразию
    const orderGrid = grid.map((cell) => {
        const ordered = Object.keys(cell).sort().reduce(
            (obj, key) => { 
              obj[key] = cell[key]; 
              return obj;
            }, 
            {}
        );
        return ordered;
    }).sort((a, b) => a.z - b.z).sort((a, b) => a.x - b.x);

    if(!testInitGrid(orderGrid)) {
        return false;
    }
    return orderGrid
}



console.table(initGrid());