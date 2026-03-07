export interface BoardCell {
    id: string
    index: number
    row: number
    col: number
    x: number
    y: number
}

export interface BoardBoxCenter {
    id: string
    row: number
    col: number
    x: number
    y: number
    isPathCell: boolean
}

const CELL_STEP = 100
const GRID_ORIGIN_X = 150
const GRID_ORIGIN_Y = 150
const GRID_SIZE = 5

const toCanvasPoint = (row: number, col: number) => ({
    x: GRID_ORIGIN_X + (col * CELL_STEP),
    y: GRID_ORIGIN_Y + (row * CELL_STEP)
})

// Ordered playable path for now (clockwise ring-like route).
// Later backend can send path IDs and frontend can map them using these IDs.
const PATH_GRID_ORDER: Array<{ row: number; col: number }> = [
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 0, col: 5 },

    { row: 1, col: 6 },
    { row: 2, col: 6 },
    { row: 3, col: 6 },
    { row: 4, col: 6 },
    { row: 5, col: 6 },

    { row: 6, col: 5 },
    { row: 6, col: 4 },
    { row: 6, col: 3 },
    { row: 6, col: 2 },
    { row: 6, col: 1 },

    { row: 5, col: 0 },
    { row: 4, col: 0 },
    { row: 3, col: 0 },
    { row: 2, col: 0 },
    { row: 1, col: 0 }
]

const pathId = (row: number, col: number) => `r${row}-c${col}`

export const boardPath: BoardCell[] = PATH_GRID_ORDER.map((cell, index) => {
    const point = toCanvasPoint(cell.row, cell.col)

    return {
        id: pathId(cell.row, cell.col),
        index,
        row: cell.row,
        col: cell.col,
        x: point.x,
        y: point.y
    }
})

export const boardPathIds: string[] = boardPath.map((cell) => cell.id)

const pathIdSet = new Set(boardPathIds)

// Dot center for every grid box. Useful if backend later sends a full board state.
export const boardBoxCenters: BoardBoxCenter[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const row = Math.floor(i / GRID_SIZE)
    const col = i % GRID_SIZE
    const point = toCanvasPoint(row, col)
    const id = pathId(row, col)

    return {
        id,
        row,
        col,
        x: point.x,
        y: point.y,
        isPathCell: pathIdSet.has(id)
    }
})

export const getBoardPathCell = (index: number): BoardCell | undefined => boardPath[index]

export const getBoardCellById = (id: string): BoardBoxCenter | undefined =>
    boardBoxCenters.find((cell) => cell.id === id)