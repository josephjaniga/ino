#!/usr/bin/env node

/**
 * Select a board from the list
 * Save the selected board
 * Provide future actions on that board by id regardless of the port it is attached to
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

program
    .version('0.0.1')
    .command('boards')
    .description('Lists the attached boards')
    // .option()
    .action(boardsAction);

program
    .version('0.0.1')
    .command('select <boardNumber>')
    .description('Select a board to set as default')
    .action(selectAction);

program
    .version('0.0.1')
    .command('compile <sketch>')
    .description('Compile a sketch for the active board')
    .action(compileAction);

program
    .version('0.0.1')
    .command('upload <sketch>')
    .description('Upload a sketch to the active board')
    .action(uploadAction);

function boardsAction (cmd) {

    let arduinoCommandOutput = execSync(`arduino-cli board list`);
    let outputString = arduinoCommandOutput.toString();

    let index = outputString.indexOf('FQBN');
    outputString = outputString.slice(index);

    let workingArray = outputString.split('\n');
    workingArray = workingArray.filter(n => n !== '');

    let boards = workingArray.slice(1);

    workingArray = [];

    let displayIndex = 0;

    console.log(`# - FBQN\t\tPORT\tID\t\tNAME`);

    for (let board of boards) {
        let temp = board.split('\t');

        workingArray.push({
            displayIndex,
            fqbn: temp[0].trim(),
            port: temp[1].trim(),
            id: temp[2].trim(),
            name: temp[3].trim()
        });

        console.log(`${displayIndex} - ${temp[0]}\t${temp[1]}\t${temp[2]}\t${temp[3]}\t`);
        displayIndex++;
    }

    if (fs.existsSync(BOARD_DB_FILE)){
        fs.truncateSync(BOARD_DB_FILE);
    }

    fs.writeFileSync(BOARD_DB_FILE, JSON.stringify(workingArray));
}

function selectAction (boardNumber, cmd) {

    if (fs.existsSync(ACTIVE_BOARD_FILE)){
        fs.truncateSync(ACTIVE_BOARD_FILE);
    }

    let boards = JSON.parse(fs.readFileSync(BOARD_DB_FILE));
    let board = boards[boardNumber];

    console.log(`\nSelected Board ${board["displayIndex"]}\n`);
    console.log(`FQBN: ${board["fqbn"]}`);
    console.log(`id: ${board["id"]}`);
    console.log(`name: ${board["name"]}`);
    console.log(`port: ${board["port"]}`);

    fs.writeFileSync(ACTIVE_BOARD_FILE, JSON.stringify(board));

}

function compileAction (sketch, cmd) {

    console.log(`Attempting to compile ${sketch} for board:\n`);

    let activeBoard = getActiveBoard();

    console.log(`\n`);

    let command = `arduino-cli compile --fqbn ${activeBoard.fqbn} ${sketch}`
    let arduinoCommandOutput = execSync(command);

    console.log(arduinoCommandOutput.toString());

}

function uploadAction (sketch, cmd) {

    console.log(`Attempting to upload ${sketch} to board:\n`);

    let activeBoard = getActiveBoard();

    console.log(`\n`);

    let command = `arduino-cli upload -p ${activeBoard.port} --fqbn ${activeBoard.fqbn} ${sketch}`
    let arduinoCommandOutput = execSync(command);

    console.log(arduinoCommandOutput.toString());
}

function getActiveBoard () {
    let board = JSON.parse(fs.readFileSync(ACTIVE_BOARD_FILE));
    console.log(board);
    return board;
}

program.parse(process.argv);