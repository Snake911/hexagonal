const level = 2;

let grid = initGrid();

function initGrid() {
    const grid = [];
    let rows = level;
    let down = 0;
    let up = (level - 1); 
    for(let x = -(level - 1); x < level; x++) {            
        for(let r = 0, z = down, y = up; r < rows; r++, z++, y--) {
            grid.push({x, y, z, value: 0});
        }
        if(x < 0) {
            rows++;
            down--;
        } else {
            rows--;
            up--;
        }        
    }
    return grid;
}

function drawGrid(gridArr) {
    const grid = document.createElement('div');
    grid.classList.add('grid');
    let x, column;
    gridArr.forEach(gridCell => {
        if(gridCell.x !== x) {
            if(column) {
                grid.append(column);
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
    grid.append(column);
    const game = document.getElementById('game');
    game.append(grid);
}

function getValueGrid(grid) {
    const notEmptyCells = grid.filter(cell => cell.value > 0);
    fetch(`http://localhost:13337/${level}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(notEmptyCells),
    })
    .then(response => response.json())
    .then(response => {
        grid.forEach(elementGrid => {
            response.forEach(element => {
                if(elementGrid.x === element.x && elementGrid.y === element.y && elementGrid.z === element.z) {
                    const cell = document.getElementById(`${element.x}_${element.y}_${element.z}`);
                    cell.dataset.value = element.value;
                    elementGrid.value = element.value;
                }                
            });
        });        
        updateGrid();
    })
    .catch(() => console.log('some error'));
}

function updateGrid() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        if(cell.dataset.value > 0) {
            cell.textContent = cell.dataset.value;
        }
    });
}

function down() {
    grid.sort((a, b) => a.x - b.x);
    
}

 
drawGrid(grid);
getValueGrid(grid);
document.addEventListener('keydown', function(event) {
    if (event.code == 'KeyS') {
        down();
    }
});