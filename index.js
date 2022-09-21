
function execCmd(args){
    if(args.length==0)
        return;

    let a = (args[0] == 'lhere' ? 1 : 0);

    for(; a<args.length; a++){
        
    }
}

execCmd([...process.argv]);

module.exports = execCmd;