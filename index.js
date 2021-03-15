const level = 3;

/*fetch(`http://51.15.207.127:13337/${level}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify([])
})
.then(response => response.json())
.then(response => console.log(response));*/

function initGrid() {
    const grid = [];
    let rows = level;
    let down = 0;
    let up = (level - 1); 
    for(let x = -(level - 1); x < level; x++) {            
        for(let r = 0, z = down, y = up; r < rows; r++, z++, y--) {
            grid.push({x, y, z});
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
        cell.textContent = `${gridCell.x} ${gridCell.y} ${gridCell.z}`
        x = gridCell.x;
        column.append(cell);
    });
    grid.append(column);
    const game = document.getElementById('game');
    game.append(grid);
}

const grid = initGrid();

drawGrid(grid);

console.table(grid);