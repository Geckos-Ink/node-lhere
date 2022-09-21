# node-lhere

### A global node tool for launching scripts where you want

**lhere** stands for "*launch here*", so you can launch your scripts anywhere in the terminal. 

*Version: 0.1.0*

## Install

> `npm i lhere -g`

## Usage

You can use this program for creating fast global commands in the terminal

#### Commands list:

```
lhere     [name]                  => Execute command with specified name
lhere     /[name]                 => Execute command from the working directory where it was created
lhere +   [name] [path or cmd]    => Create a command with the specified name and path/cmd
lhere ++  [name] [path or cmd]    => Create or replace a command
lhere -   [name]                  => Remove the specified command
lhere ..                          => List all stored commands
```

#### Examples:

```
$ lhere + script ./script.js
$ lhere + hello "echo hello"

$ lhere hello
```

## Credits

Created by Riccardo Cecchini (cekkr@GitHub) for Gecko's Ink - 2022