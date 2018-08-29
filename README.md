# ino

A CLI wrapper written in NodeJS for the `arduino-cli` go application, with the intention of making the CLI easier to use.

 Sometimes uploading a sketch to an Arduino Board will change how the system recognizes the Device.  This can cause COM ports to change based on how the new device drivers may have installed it.  This would normally cause you to lose the board on the device list, and have to go fish from the list to identify its new ports.  `ino` will keep the devices unique identifier and do all of that work for you.  Just activate the board you want to work with and go about your business.  Need to change the usb port you are using?  Going to install a sketch to a HID device that will make the system recognize it as a Mouse? Keyboard? Joystick? Don't worry about it.

## Features

* Select a board to "activate" it, and the remaining commands will use that board.
* Will identify the board by its unique ID, if ports change it will identify where the board is and work with it transparent to you.

## Requirements

* Expects Arduino IDE 1.6.x or greater to be installed on your system
* Expects `arduino-cli` to be available to the command line
* Requires NodeJS 8.x.x

---

## Usage

```
$ ino -h

  Usage: ino [options] [command]

  Options:

    -V, --version         output the version number
    -h, --help            output usage information

  Commands:

    boards                Lists the attached boards
    select <boardNumber>  Select a board to set as the active board
    compile [sketch]      Compile a sketch for the active board.  If no sketch path is provided will attempt to use the current working
 directory.
    upload [sketch]       Upload a sketch to the active board.  If no sketch path is provided will attempt to use the current working d
irectory.

```

---

### `ino boards`

This command will list the boards connected to the system, each identified on the left with a Unique Zero Based Index 0-N.  Note plugging boards, unplugging boards and uploading sketches to boards will change the board connections to the system.

```
$ ino boards
# - FBQN                PORT    ID              NAME
0 -                     COM3    1A86:7523       unknown
1 - arduino:avr:micro   COM4    2341:8037       Arduino/Genuino Micro
```

---

### `ino select <boardNumber>`

* &lt;boardNumber&gt; required - should be an integer from 0 - N representing the index displayed from the `ino boards` command

This command will set the selected board to active, effectively saving it for use with further `ino` commands.

```
$ ino select 1

Selected Board 1

FQBN: arduino:avr:micro
id: 2341:8037
name: Arduino/Genuino Micro
port: COM4
```

---

### `ino compile [sketch]`

* [sketch] optional - a Path to the sketch you are trying to compile.  If this path is not provided, will default to the current working directory.

Compile the provided sketch for the active board.

```
$ ino compile /c/Path/To/Your/Sketch
Attempting to compile /c/Path/To/Your/Sketch for board:

FQBN: arduino:avr:micro
id: 2341:8037
name: Arduino/Genuino Micro
port: COM4

Sketch uses 4130 bytes (14%) of program storage space. Maximum is 28672 bytes.
Global variables use 149 bytes (5%) of dynamic memory, leaving 2411 bytes for local variables. Maximum is 2560
bytes.
```

---

### `ino upload [sketch]`

* [sketch] optional - a Path to the sketch you are trying to compile.  If this path is not provided, will default to the current working directory.

Upload a compiled sketch for the active board.

```
$ ino upload /c/Path/To/Your/Sketch
Attempting to upload /c/Path/To/Your/Sketch to board:

FQBN: arduino:avr:micro
id: 2341:8037
name: Arduino/Genuino Micro
port: COM4

Connecting to programmer: .
Found programmer: Id = "CATERIN"; type = S
    Software Version = 1.0; No Hardware Version given.
Programmer supports auto addr increment.
Programmer supports buffered memory access with buffersize=128 bytes.

Programmer supports the following devices:
    Device code: 0x44
```
