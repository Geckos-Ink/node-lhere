const fs = require('fs');
const { spawn } = require("child_process");

const package_json = require('./package.json');

const isWin = process.platform === "win32";
const cwd = process.cwd();

const talker = false;
const jsonDb = __dirname + '/db.json';

let db = {
    aliases: {}
};

if(fs.existsSync(jsonDb)){
    let json = fs.readFileSync(jsonDb);
    db = JSON.parse(json);
}

function normalizePath(path){
    if(isWin)
        path = path.replaceAll('/','\\').replaceAll('\\\\','\\');
    else 
        path = path.replaceAll('\\','//').replaceAll('//','/');

    return path;
}

function execCmd(args){
    let changes = false;

    if(args.length==0)
        return;

    let a =  args[0] == 'lhere' ? 1 : 0;

    function flush(){
        return args[a++];
    }

    function fnAdd(force){
        let name = flush();
        let path = flush();

        if(!name || !path){
            console.error("Error in add request: lhere + [name] [path or command]")
        }

        if(!force && db.aliases[name]){
            console.error(name, "command already exists. Force the command replace with lhere ++ " + name + ' "'+path+'"');
        }
        else {
            let cmdAsIs = path;
            let tmpPath = undefined;

            if(path[0] != '/' || (path.length < 2 || path[1]!=':')){
                tmpPath = cwd + '/' + path;
            }
            else if(path.startsWith('./')){
                tmpPath = cwd + path.substr(1);
            }

            let isFile = false;
            if(tmpPath && fs.existsSync(tmpPath)){
                path = normalizePath(tmpPath);
                isFile = true;
            }
            else isFile = fs.existsSync(path);

            if(path.replaceAll(" ","").length == 0 && !isFile){
                console.error('Command "'+path+'" not recognized. Operation aborted'); // to be studied
            }
            else {
                db.aliases[name] = {cmd: path, cmdAsIs, isFile: isFile, cwd: cwd};
                changes = true;

                console.log("Command", name, "added as \""+path+"\"");
            }
        }
    }

    function fnRemove(){
        let name = flush();

        if(!name){
            console.error("Error in remove request: lhere - [name]")
        }

        if(!db.aliases[name]){
            console.log("Command",name, "not existing already!")
        }
        else {
            delete db.aliases[name];
            changes = true;

            console.log("Command", name, "removed.");
        }
    }

    function help(){
        console.log("Welcome in lhere v"+package_json.version);
        console.log("You can use this program for creating fast global commands in the terminal");

        console.log("\r\nCommands:");
        console.log("\tlhere [name]     => Execute command with specified name");
        console.log("\tlhere /[name]    => Execute command from the working directory where it was created")
        console.log("\tlhere +  [name] [path or cmd]    => Create a command with the specified name and path/cmd");
        console.log("\tlhere ++ [name] [path or cmd]    => Create or replace a command");
        console.log("\tlhere - [name]   => Remove the specified command");
        console.log("\tlhere ..         => List all stored commands");

        console.log("\r\nExamples:");
        console.log("\tlhere + script ./script.js");
        console.log("\tlhere + hello \"echo hello\"")
        console.log("\tlhere hello")

    }

    function exec(arg){
        let name = arg;

        let setCwd = false;
        if(name[0] == '/'){
            setCwd = true;
            name = name.substr(1);
        }

        let alias = db.aliases[name];

        if(!alias){
            console.error("Command",name, "not found.");
        }
        else {
            if(setCwd){
                process.chdir(alias.cwd);
                console.log("Working directory moved to", alias.cwd);
            }

            let cmd = alias.cmd;
            let args = undefined;

            if(alias.isFile){
                args = [alias.cmd];

                //TODO: add more extensions(?)
                if(alias.cmd.endsWith('.js'))
                    cmd = 'node';
                else 
                    cmd = isWin ? "start" : "xdg-open"; 
            }
            else {
                args = [];
                
                if(isWin){
                    cmd = 'cmd';
                    args.push('/c');
                }
                else 
                    cmd = 'eval';

                args.push(alias.cmd);
            }

            if(talker) console.log("execute", cmd, args);
            const ls = spawn(cmd, args);

            ls.stdout.on("data", data => {
                console.log(`${data}`);
            });

            ls.stderr.on("data", data => {
                console.error(`${data}`);
            });

            ls.on('error', (error) => {
                console.error("error by execution:", cmd, args);
                console.error(`${error.message}`);
            });

            ls.on("close", code => {
                //console.log(`child process exited with code ${code}`);
                process.exit(code);
            });
        }
    }

    function fnList(){
        console.log("Current lhere commands:");
        for(let a in db.aliases){
            let alias = db.aliases[a];
            console.log(a,"\t=>",alias.cmd);
        }
    }

    if(a>=args.length)
        help();

    while(a<args.length){
        let arg = flush();        
        
        if(!arg){
            help();
            break;
        }

        switch(arg){
            case '+':
                fnAdd();
                break;

            case '++':
                fnAdd(true);
                break;
            
            case '-':
                fnRemove();
                break;

            case '..':
                fnList();
                break;

            default:
                exec(arg);
                break;
        }
    }

    /// Complete saving file
    if(changes){
        let strJson = JSON.stringify(db);
        fs.writeFileSync(jsonDb, strJson);
    }
}

let argv = [...process.argv];

if(argv.length >= 2){
    if(argv[1].includes("lhere")){
        argv.splice(0,1);
        argv[0] = 'lhere';
    }
}

if(argv[0].endsWith('lhere'))
    execCmd(argv);


module.exports = execCmd;