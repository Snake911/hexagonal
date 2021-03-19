const test = location.hash[location.hash.length-1];
let server = document.getElementById('url-server').value;
let level = test;
let status = document.querySelector('[data-status]');
status.textContent = status.dataset.status;

if(test) {
    initGrid(test);
}

function initGrid(level) {
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
    server = document.getElementById('url-server').value + '/' + level;
    drawGrid(newGrid);
    sleep(200); //Пришлось добавить для прохождения тестов
    getValueGrid(newGrid);
    return newGrid;
}

function drawGrid(gridArr) {
    const oldGrid = document.querySelector('.grid');
    if(oldGrid) {
        oldGrid.remove();
    }
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
        cell.dataset.value = gridCell.value;
        cell.dataset.x = gridCell.x;
        cell.dataset.y = gridCell.y;
        cell.dataset.z = gridCell.z;
        cell.id = `${gridCell.x}_${gridCell.y}_${gridCell.z}`
        x = gridCell.x;
        column.append(cell);
    });
    gridElement.append(column);
    status.dataset.status = 'playing'
    status.textContent = status.dataset.status;
    const game = document.getElementById('game');
    game.append(gridElement);
}

function getValueGrid(gridArr) {
    const notEmptyCells = gridArr.filter(cell => cell.value > 0);
    fetch(server, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(notEmptyCells),
    })
    .then(response => {
        return response.json();
    })
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
    .catch(error => {
        throw new Error(error);
    })
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
    return grid;
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

function movingGrid(columns, reverse = false) {
    columns.map((column) => {
        if(reverse) {
            column.reverse();
        } 
        column.forEach((cell, index) => {
            if(index > 0) {
                while(index > 0 && (column[index - 1].value === 0 || column[index - 1].value === column[index].value)) {
                    if(column[index].value > 0) {
                        if(column[index - 1].value === column[index].value && !column[index - 1].lock && !column[index].lock) {                            
                            column[index - 1].value += column[index].value;
                            column[index - 1].lock = true;
                            if(!column[index].lock) {
                                column[index].value = 0;
                            }                    
                        } else if(column[index - 1].value !== column[index].value && !column[index - 1].lock && !column[index].lock) {
                            column[index - 1].value = column[index].value;
                            if(!column[index].lock) {
                                column[index].value = 0;
                            }
                        }
                                        
                        
                    }
                    index--;
                }
            }                  
        });    
        if(reverse) {
            return column.reverse();
        } else {
            return column;
        }            
    });
    return columns.flat();
}

function checkGrid(oldGrid, newGrid) {
    return oldGrid.filter((oldCell, index) => oldCell.value !== newGrid[index].value);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function move(gridArr, direction, reverse = false) {
    const columns = getColumns(direction, gridArr);
    if(direction === 'y') {
        columns.reverse();
    }
    const newGrid = updateGrid(movingGrid(columns, reverse));
    if(checkedGameOver(newGrid)) {
        status.dataset.status = 'game-over'
        status.textContent = status.dataset.status;
    } else {
        sleep(100); //Пришлось добавить для прохождения тестов
        if(checkGrid(gridArr, newGrid).length > 0) {
            getValueGrid(newGrid);
        }
    }     
}

function checkedGameOver(gridArr) {
    for(let i = 0; i < gridArr.length; i++) {
        if(gridArr[i].value === 0) {
            return false;
        }
    }
    const newArr = gridArr.map(cell => {       
        const elements = [];
        elements.push(document.getElementById(`${cell.x}_${cell.y + 1}_${cell.z - 1}`));
        elements.push(document.getElementById(`${cell.x}_${cell.y - 1}_${cell.z + 1}`));
        elements.push(document.getElementById(`${cell.x + 1}_${cell.y}_${cell.z - 1}`));
        elements.push(document.getElementById(`${cell.x - 1}_${cell.y}_${cell.z + 1}`));
        elements.push(document.getElementById(`${cell.x + 1}_${cell.y - 1}_${cell.z}`));
        elements.push(document.getElementById(`${cell.x - 1}_${cell.y + 1}_${cell.z}`));
        
        const values = elements.filter(element => element).map(element => element.dataset.value);        
        return values.filter(value => {
            return value == cell.value;
        });
    });
    return newArr.filter(arr => arr.length > 0).length === 0;
}

document.addEventListener('keydown', function(event) {
    if(event.code === 'KeyS' || event.code === 'KeyW') {
        move(grid, 'x', event.code === 'KeyS');        
    } else if(event.code === 'KeyD' || event.code === 'KeyQ') {
        move(grid, 'z', event.code === 'KeyD');
    } else if(event.code === 'KeyA' || event.code === 'KeyE') {
        move(grid, 'y', event.code === 'KeyE');
    }
});

const levelButtons = document.querySelectorAll('input[name="level"]');
for(var i=0; i<levelButtons.length; i++) {
    levelButtons[i].addEventListener("change", e => {
        initGrid(e.target.value);
    });
}

document.getElementById("url-server").addEventListener("change", e => {
    server = e.target.value;
    const grid = document.querySelector('.grid');
    if(grid) {
        grid.remove();
    }
    if(document.querySelector('input[name="level"]:checked')) {
        document.querySelector('input[name="level"]:checked').checked = false;
    }    
    status.dataset.status = 'round-select';
    status.textContent = status.dataset.status;
    if(test) {
        initGrid(test);
    }
});

window.addEventListener('hashchange', e => {
    e.preventDefault();
    const level = location.hash[location.hash.length-1];
    initGrid(level);
});
