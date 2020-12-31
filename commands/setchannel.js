const axios = require('axios')
var qs = require('qs');

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function ArrayHas(array = [], value){
    for(let i = 0; i < array.length; i++){
        if(array[i].toLowerCase().toString()  === value.toLowerCase().toString() )return true;
    }
    return false;
}

function ArrayRemove(array = [], pos){
    var res = [];
    for(let i = 0; i < pos; i++){
        res.push(array[i]);
    }
    for(let i = pos + 1; i < array.length; i++){
        res.push(array[i]);
    }
    return res;
}

function GetSameLetters(original, similar){
    var disponible = [];
    for(let i = 0; i < original.length; i++){
        disponible.push(original.charAt(i).toLowerCase());
    }

    for(let i = 0; i < similar.length; i++){
        if(disponible.length == 0)break;
        if(ArrayHas(disponible, similar.charAt(i))){
            var index = disponible.indexOf(similar.charAt(i).toLowerCase());
            disponible = ArrayRemove(disponible, index);
        }
    }

    var matching = original.length - disponible.length;

    return matching;
}

function GetSimilarName(client, name, message){                 //Fix typo errors finding the closest name syntax form users inside a voice channel    
    var all_members = [];

    var guild = client.guilds.cache.get(message.channel.guild.id);
    guild.members.cache.forEach(member =>{                          //
        all_members.push(member.user.username);                     //Get all users inside a chanel
    });                                                             //

    var most_similar;                                               //
    var most_similar_amount = 0;                                    //prepare variables
    let current_name = name;                                        //

    for(let j = 0; j < all_members.length; j++){                    //check for every member
        if(current_name === all_members[j]){                        //if name matches
            return current_name;                                    //return that name
        }else{
            var temp_same_letter_amount = GetSameLetters(current_name, all_members[j]); //otherwise get number of same letters between given name and user[i]
            if(temp_same_letter_amount > most_similar_amount){              //if it's higher than the most similar saved
                most_similar_amount = temp_same_letter_amount;              //save it
                most_similar = all_members[j];                              //
            }
        }
    }

    if(most_similar == null){
        message.channel.send("Non esiste nessuna persona online in un canale vocale con quel nome, idiota che non sei altro");
        return null;
    }

    message.channel.send("Ovviamente hai scritto di merda, ma per fortuna l'ho corretto con '" + most_similar + "'");
    return most_similar;    //return the most similar name found
}

class Rules {
    rules = ["w"];

    IsRule(line){
        console.log("Line : " + line);
        if(line.charAt(1) !== " "){ //example -wLogos, it should be -w Logos
            return 1;   //Error 1, typo error
        }
        
        var words = [];
        words = line.split(" ");
        if(words[1] === "*"){
            return 0;
        }

        var found = false;
        
        this.rules.forEach(rule => {
            if(found)return 0;
            if(rule === line.charAt(0).toLowerCase()){
                //check args
                var args = ArrayRemove(line.split(" "), 0);
                args = ArrayRemove(args, args.length - 1);
                if(args.length > 0){
                    //no errors
                    found = true;
                    return 0;
                }
            }
        });

        if(found)return 0;
        //no rule exists
        return 2;
    }

    AddWhiteList(args, channel, client, message){
        /*if(!Array.isArray(args)){    //everyone can join
            AddToWhiteList(channel, "*", message);
        }*/
        var names = [];                                                 //Save given names
        var end = false;
        for (let i = 1; i < args.length; i++) {                         //0 is for name and 1 is for size, start from 2
            var sim_name = GetSimilarName(client, args[i], message);    //
            if(sim_name != null){                                       //
                names.push(sim_name);                                   //fix typo errors
            }                                                           //
            else{
                console.log("breaking");
                end = true;
                break;
            }
        }                                                               //
        console.log("end : " + end);
        if(!end){
            var id = [];                                                //get whitelists users' id
            for (let i = 0; i < names.length; i++) {
                var temp = client.users.cache.find(user => user.username == names[i]);
                if(temp == null){
                    message.channel.send("Il nome " + names[i] + " non esiste brutto dislessico di merda, lo skippo");
                }else{
                    id.push(temp.id);
                }
            }

            AddToWhiteList(channel, id, message);
        }else{
            axios({
                method: 'post',
                url: 'http://crart.altervista.org/discordbot/actions/deletechannel.php',
                data: qs.stringify({
                    server_id : message.guild.id,
                    channel_id : channel.id
                })
            })
            .then(result => {
                if(result.data == "0"){
                    channel.delete();
                    return;
                }
                
            })
            .catch(error => {
                console.error(error)
            })
            return;
        }
    }

    HandleCommand(command, channel, client, message){
        var args = command.split(" ");
        console.log("Args : " + command);
        switch(args[0]){
            case "w":
                /*if(args[1] === "*"){
                    this.AddWhiteList("*", channel, client, message);
                    return;
                }*/
                this.AddWhiteList(ArrayRemove(args, args.length - 1), channel, client, message);
                break;
        }
    }
}

function AddToWhiteList(channel, id, message){
    global.UpdateWhiteList(channel.guild, channel.id, id, message);  //Add users to whitelist
}

function CreateChannel(message, name, size, rules = [], client){
    message.guild.channels                                      //Create vocal channel
        .create(name, {
            type: 'voice',                                          //it's vocal
        })
        .then((channel) => {
            channel.setUserLimit(size);                             //Set channel size (won't set if size is null)
            global.GetRequest(channel.guild, channel.id, function(){
                if(rules == null)return;
                var r = new Rules();
                rules.forEach(rule_command => {
                    r.HandleCommand(rule_command, channel, client, message);    //assign all rules
                });
            })                      //Save server on global_vars
            //wait until the function above has finished
            
        })
}

function RemoveLimit(command){
    var name = "";
    var space = false;
    for(let i = 0; i < command.length; i++){
        var parsed = Number.parseInt(command.charAt(i), 10);
        if(command.charAt(i) === " "){
            space = true;
            name += " ";
        }else if(!Number.isNaN(parsed)){
            if(space)return name;
        }else{
            name += command.charAt(i);
        }
    }
    return null;
}

function RemoveRules(command){
    var result = "";
    for(let i = 0; i < command.length; i++){
        if(command.charAt(i) === "-"){
            return result;
        }else{
            result += command.charAt(i);
        }
    }
}

function HasLimit(has_limit){
    var temp_parsed = "";
    for(let i = 0; i < has_limit.length; i++){
        temp_parsed = Number.parseInt(has_limit[i], 10);
        if(!Number.isNaN(temp_parsed)){
            return true;
        }
    }
    return false;
}

function GetSizePosition(command){
    var space = false;
    var pos = 0;
    for(let i = 0; i < command.length; i++){
        var parsed = Number.parseInt(command.charAt(i), 10);
        if(command.charAt(i) === " "){
            space = true;
            pos++;
        }else if(!Number.isNaN(parsed)){
            if(space)return pos;
        }
    }
    return null;
}

function IsNumber(object){
    var parsed = Number.parseInt(object, 10);
    if(Number.isNaN(parsed)){
        return false;
    }else{
        return true;
    }
}

function NameHasSpaces(name){
    var size_pos = GetSizePosition(name);
    var has_rules = name.split("-");

    if(size_pos == null && has_rules.length < 2)return true;

    for(let i = 0; i < name.length; i++){
       if(name.charAt(i) === " "){
            if(IsNumber(name.charAt(i + 1))){
                return false;
            }else{
                return true;
            }
       }
    }

    if(has_rules.length > 1){
        return true;
    }

    return false;
}

function CalculateSize(command){
    var white = command.split("-");
    for(let i = 0; i < white.length; i++){
        if(white[i].charAt(0) === "w" && white[i].charAt(1) === " "){
            var words = white[i].split(" ");
            return words.length - 2;
        }
    }
    return 0;
}

module.exports = {
    name: 'setchannel',
    descriprion: "Create a channel",
    execute(message, args, client){
        if(args[0] == null){
            message.channel.send("*Coglione, leggi come usare il comando");
            return;
        }
        //#region Check Name Syntax
            //check if it has rules ans limit
            var complete_command = "";
            var size_pos = 1;
            var name = "";
            for(let i = 0; i < args.length; i++){
                complete_command += args[i] + " ";
            }
            //Analyze complete command
            if(NameHasSpaces(complete_command)){
                var has_rules = complete_command.split("-");
                if(has_rules.length == 1){  //No rules
                    //check limit
                    var has_limit = has_rules[0].split(" ");
                    var has_limit_confirm = HasLimit(has_limit);
                    if(!has_limit_confirm){                                                     //If doesn't have rules and limit
                    name = complete_command;
                    if(name.length > 99){
                        message.channel.send("Guarda che la lunghezza del messaggio " +
                        "non è direttamente proporzionale alla lunghezza del cazzo, massimo 100 caratteri");
                        return;
        
                    }else if(name.length < 1){
                        message.channel.send("Si ma metti il nome e che cazzo");
                        return;
                    }
                    if(!isASCII(name)){
                        message.channel.send("Ti piace proprio l'arte di rompere il cazzo eh? Accetto solo caratteri ASCII, tiè");
                        return;
                    }
                        CreateChannel(message, name, null, null, client);
                        return; 
                    }else{                                                                     //If doesn't have rules but has limit
                        size_pos = GetSizePosition(complete_command) - 1;
                        name = RemoveLimit(complete_command);  
                        if(name == null){
                            message.channel.send("Scusa come cazzo ti chiami? Il tuo bel nome di merda inizia con una lettera o con un numero?");
                            return;
                        }
                    }
                }else{                                                                      //Has rules
                    var has_limit = complete_command.split(" ");
                    var has_limit_confirm = HasLimit(has_limit);
                    if(!has_limit_confirm){                                                     //Doesn't have limit
                        size_pos = null;
                        name = RemoveRules(complete_command);
                    }else{
                        size_pos = GetSizePosition(complete_command);
                        name = RemoveRules(complete_command);
                        name = RemoveLimit(name);
                    }
                }

            }else{
                if(args[0].length > 99){
                    message.channel.send("Guarda che la lunghezza del messaggio "+
                        "non è direttamente proporzionale alla lunghezza del cazzo, massimo 100 caratteri");
                    return;
    
                }else if(args[0].length < 1){
                    message.channel.send("Si ma metti il nome e che cazzo");
                }
                if(!isASCII(args[0])){
                    message.channel.send("Ti piace proprio l'arte di rompere il cazzo eh? Accetto solo caratteri ASCII, tiè");
                    return;
                }
                name = args[0];
            }
        //#endregion

        //#region Check size Syntax
            var size = null;
            if(size_pos != null){
                if(args[size_pos] != null){
                    const parsed = Number.parseInt(args[size_pos], 10);
                    if (Number.isNaN(parsed)) {
                        message.channel.send("Testa di cazzo, deve essere un numero");
                        return;
                    }else{
                        if(parsed > 100){
                            message.channel.send("Faccia di merda, sei inutile alla vita. Deve essere minore di 100");
                            return;
                        }
                    }
                    size = parsed;
                }else{
                    size = args[size_pos];
                }
            }else{
                size = CalculateSize(complete_command);
            }
        //#endregion
        
        //#region Rule Syntax
            var rule = "";                                                  //
            for(let i = size_pos + 1; i < args.length; i++){                           //Build rules in a string
                rule += args[i] + " ";                                      //
            }
            if(rule === ""){
                console.log("command : " + complete_command);
                var elements = complete_command.split("-");
                if(elements.length == 0){
                    message.channel.send("Non esiste -");
                }else{
                    message.channel.send("Le cose sono 2. O il nome inizia con un numero, e mi pare che i tuoi genitori abbiano deciso di usare delle lettere" +
                                    ", oppure non hai messo un cazzo, e mi pare che i tuoi genitori abbiano deciso di darti un nome");
                    return;
                    var command = false;
                    var r = new Rules(); 
                    for(let k = 1; k < elements.length; k++){
                        var elem = elements[k];
                        var parts = elem.split(" ");
                        for(let j = 0; j < parts.length - 1; j++){
                            var part = parts[j];
                            if(r.IsRule(part)){
                                console.log(part + " is a rule");
                                command = true;
                            }else{
                                console.log(part + " is not a rule");
                                if(!isASCII(part)){
                                    message.channel.send("Che bel nome di merda che ti h anno dato i tuoi genitori, non sapevo fossero dei nemici dell'ASCII");
                                    return;
                                }else{
                                    console.log(part + " is a ascii");
                                    if(IsNumber(part)){
                                        message.channel.send("Le cose sono 2. O il nome inizia con un numero, e mi pare che i tuoi genitori abbiano deciso di usare delle lettere" +
                                    ", oppure non hai messo un cazzo, e mi pare che i tuoi genitori abbiano deciso di darti un nome");
                                    return;
                                    }
                                }
                            }
                        }
                    }
                }
                /*message.channel.send("Le cose sono 2. O il nome inizia con un numero, e mi pare che i tuoi genitori abbiano deciso di usare delle lettere" +
                                    ", oppure non hai messo un cazzo, e mi pare che i tuoi genitori abbiano deciso di darti un nome");
                return;*/
            }else{
                var rules = [];
                rules = rule.split("-");                                        //split the sting for each - (sub_rule)
                rules = ArrayRemove(rules, 0);                                  //remove empty slot
                //if(rules.length == 0)size = null;                               //if no rule assigned, then the channel won't have a limit, no one could join in it
                var r = new Rules(); 
                var error = false;
                rules.forEach(rule_line => {
                    var result = r.IsRule(rule_line);                           //check rule syntax
                    switch (result) {
                        case 0:
                            //Everything is good
                            break;

                        case 1:
                            message.channel.send("Ho capito che sei stupido, ma hai dimenticato lo spazio tra il comando e gli argomenti");
                            error = true;
                            return;

                        case 2:
                            message.channel.send("Stupido troglodita del cazzo, non esiste quel comando");
                            error = true;
                            return;
                    
                        default:
                            message.channel.send("Error : " + result);
                            error = true;
                            return;
                    }
                });

                if(error)return;
            }
            

        //#endregion
            CreateChannel(message, name, size, rules, client);

    }
}