const level = 3;

let grid = initGrid();

function initGrid() {
    const newGrid = [];
    let rows = level;
    let down = 0;
    let up = (level - 1); 
    for(let x = -(level - 1); x < level; x++) {            
        for(let r = 0, z = down, y = up; r < rows; r++, z++, y--) {
            newGrid.push({x, y, z, value: 0});
        }
        if(x < 0) {
            rows++;
            down--;
        } else {
            rows--;
            up--;
        }        
    }
    return newGrid;
}

function drawGrid(gridArr) {
    const gridElement = document.createElement('div');
    gridElement.classList.add('grid');
    let x, column;
    gridArr.forEach(gridCell => {
        if(gridCell.x !== x) {
            if(column) {
                gridElement.append(column);
            }
            column = document.createElement('div');
            column.classList.add('column');
        }
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = gridCell.x;
        cell.dataset.y = gridCell.y;
        cell.dataset.z = gridCell.z;
        cell.dataset.value = gridCell.value;
        cell.id = `${gridCell.x}_${gridCell.y}_${gridCell.z}`
        x = gridCell.x;
        column.append(cell);
    });
    gridElement.append(column);
    const game = document.getElementById('game');
    game.append(gridElement);
}

function getValueGrid(gridArr) {
    const notEmptyCells = gridArr.filter(cell => cell.value > 0);
    fetch(`//68f02c80-3bed-4e10-a747-4ff774ae905a.pub.instances.scw.cloud/${level}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(notEmptyCells),
    })
    .then(response => response.json())
    .then(response => {
        gridArr.forEach(elementGrid => {
            response.forEach(element => {
                if(elementGrid.x === element.x && elementGrid.y === element.y && elementGrid.z === element.z) {
                    const cell = document.getElementById(`${element.x}_${element.y}_${element.z}`);
                    cell.dataset.value = element.value;
                    elementGrid.value = element.value;
                }                
            });
        });
        updateGrid(gridArr);
    })
    .catch(() => console.log('some error'));
}

function updateGrid(gridArr) {
    gridArr.forEach((elementGrid) => {
        const cell = document.getElementById(`${elementGrid.x}_${elementGrid.y}_${elementGrid.z}`);
        cell.dataset.value = elementGrid.value;
    });
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        if(cell.dataset.value > 0) {
            cell.textContent = cell.dataset.value;
        } else {
            cell.textContent = '';
        }
    });
    grid = gridArr.sort((a, b) => a.x - b.x);
}

function getColumns(coord, gridArr) {
    const tempGrid = gridArr;
    tempGrid.sort((a, b) => a[coord] - b[coord]);    
    let columnCoord = tempGrid[0][coord];
    const columns = [];
    let column = [];
    tempGrid.forEach((cell) => {
        if(cell[coord] !== columnCoord) {
            columns.push(column);
            column = [];
            column.push({x: cell.x, y: cell.y, z: cell.z, value: cell.value});    
        } else {
            column.push({x: cell.x, y: cell.y, z: cell.z, value: cell.value}); 
        }
        columnCoord = cell[coord];        
    });
    columns.push(column);
    return columns;
}

function checkGrid(oldGrid, newGrid) {
    for(let i = 0; i < oldGrid.length; i++) {
        if(oldGrid[i].value !== newGrid[i].value) {
            return false;
        }
    }
    return true;
}

function movingGrid(gridArr, columns, reverse = false) {
    const oldGrid = gridArr;
    columns.map((column) => {
        if(reverse) {
            column.reverse();
        }        
        column.forEach((cell, index) => {
            if(cell.value > 0 && index > 0 && column[index - 1].value === 0) {
                column[index - 1].value = cell.value;
                column[index].value = 0;
            }
        });
        if(reverse) {
            return column.reverse();
        } else {
            return column;
        }            
    });    
    const newGrid = columns.flat();
    if(!checkGrid(oldGrid, newGrid)) {
        movingGrid(newGrid, columns, reverse);
    }
    return newGrid;
}

function move(gridArr, direction, reverse = false) {    
    const columns = getColumns(direction, gridArr);    
    updateGrid(movingGrid(gridArr, columns, reverse));
}

 
drawGrid(grid);
getValueGrid(grid);
document.addEventListener('keydown', function(event) {
    console.log(event.code === 'KeyS');
    if(event.code === 'KeyS' || event.code === 'KeyW') {
        move(grid, 'x', event.code === 'KeyS');        
    } else if(event.code === 'KeyD' || event.code === 'KeyQ') {
        move(grid, 'z', event.code === 'KeyD');
    } else if(event.code === 'KeyA' || event.code === 'KeyE') {
        move(grid, 'y', event.code === 'KeyA');
    }
});