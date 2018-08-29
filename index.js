/**
 * Operate on boards by the board ID... not numeric index
 */

'use strict';

// constants
const HOME_DIR = require('os').homedir();
const INO_DIR = `${HOME_DIR}/.ino`;

const BOARD_DB_FILE = `${INO_DIR}/boards.json`;
const ACTIVE_BOARD_FILE = `${INO_DIR}/active.json`;

// libs
const program = require('commander');
const execSync = require('child_process').execSync;
const fs = require('fs');

if (!fs.existsSync(INO_DIR)){
    fs.mkdirSync(INO_DIR);
}

program.version('0.0.1');

program
    .command('boards')
    .description('Lists the attached boards')
    // .option()
    .action(boardsAction);

program
    .command('select <boardNumber>')
    .description('Select a board to set as the active board')
    .action(selectAction);

program
    .command('compile [sketch]')
    .description('Compile a sketch for the active board.  If no sketch path is provided will attempt to use the current working directory.')
    .action(compileAction);

program
    .command('upload [sketch]')
    .description('Upload a sketch to the active board.  If no sketch path is provided will attempt to use the current working directory.')
    .action(uploadAction);

function boardsAction (cmd) {

    let boardList = getFormattedBoardListFromArduino();

    displayBoardList(boardList);

    if (fs.existsSync(BOARD_DB_FILE)){
        fs.truncateSync(BOARD_DB_FILE);
    }

    fs.writeFileSync(BOARD_DB_FILE, JSON.stringify(boardList));
}

function selectAction (boardNumber, cmd) {

    if (fs.existsSync(ACTIVE_BOARD_FILE)){
        fs.truncateSync(ACTIVE_BOARD_FILE);
    }

    let boards = JSON.parse(fs.readFileSync(BOARD_DB_FILE));
    let board = boards[boardNumber];

    console.log(`\nSelected Board ${board["displayIndex"]}\n`);
    logBoard(board);

    fs.writeFileSync(ACTIVE_BOARD_FILE, JSON.stringify(board));

}

function compileAction (sketch, cmd) {

    if (!sketch) {
        sketch = process.cwd();
    }

    let activeBoard = getActiveBoard();
    let foundBoard = findBoardById(activeBoard.id);

    if (activeBoard.port != foundBoard.port) {
        console.log("The Active board has changed.  Found it by unique ID.")
    }

    console.log(`Attempting to compile ${sketch} for board:\n`);
    logBoard(foundBoard);

    let command = `arduino-cli compile --fqbn ${foundBoard.fqbn} ${sketch}`;
    let arduinoCommandOutput = execSync(command);

    console.log(arduinoCommandOutput.toString());

}

function uploadAction (sketch, cmd) {

    if (!sketch) {
        sketch = process.cwd();
    }

    let activeBoard = getActiveBoard();
    let foundBoard = findBoardById(activeBoard.id);

    console.log(`Attempting to upload ${sketch} to board:\n`);
    logBoard(foundBoard);

    let command = `arduino-cli upload -p ${foundBoard.port} --fqbn ${foundBoard.fqbn} ${sketch}`
    let arduinoCommandOutput = execSync(command);

    console.log(arduinoCommandOutput.toString());
}

function getActiveBoard () {
    let board = JSON.parse(fs.readFileSync(ACTIVE_BOARD_FILE));
    return board;
}

function getFormattedBoardListFromArduino () {

    let arduinoCommandOutput = execSync(`arduino-cli board list`);
    let outputString = arduinoCommandOutput.toString();

    let index = outputString.indexOf('FQBN');
    outputString = outputString.slice(index);

    let boardList = outputString.split('\n');
    boardList = boardList.filter(n => n !== '');

    let boards = boardList.slice(1);

    boardList = [];

    let displayIndex = 0;

    for (let board of boards) {
        let temp = board.split('\t');

        boardList.push({
            displayIndex,
            fqbn: temp[0].trim(),
            port: temp[1].trim(),
            id: temp[2].trim(),
            name: temp[3].trim()
        });

        displayIndex++;
    }

    return boardList;
}

function displayBoardList (boardList) {

    let fqbnLabel = pad('                      ', 'FQBN'),
        portLabel = pad('              ', 'PORT'),
        idLabel = pad('            ', 'ID'),
        nameLabel = pad('                              ', 'NAME');

    console.log(`# - ${fqbnLabel}${portLabel}${idLabel}${nameLabel}`);

    for (let board of boardList) {

        let fqbn = pad('                      ', board.fqbn),
            port = pad('              ', board.port),
            id = pad('            ', board.id),
            name = pad('                              ', board.name);

        console.log(`${board.displayIndex} - ${fqbn}${port}${id}${name}`);
    }

}

function findBoardById (boardId) {

    let boardList = getFormattedBoardListFromArduino();

    let board = boardList[boardList.findIndex(board => board.id === boardId)];

    return board;

}

function logBoard (board) {
    console.log(`fqbn: ${board["fqbn"]}`);
    console.log(`id: ${board["id"]}`);
    console.log(`name: ${board["name"]}`);
    console.log(`port: ${board["port"]}\n`);
}

function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

program.parse(process.argv);
