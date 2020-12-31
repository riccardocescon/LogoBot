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

    message.channel.send("Ovviamente hai scritto di merda, ma per fortuna ho corretto '" + current_name + "' con '" + most_similar + "'");
    return most_similar;    //return the most similar name found
}

class Rules {
    rules = ["a", "r", "n"];

    IsRule(line){
        if(line.charAt(1) !== " "){ //example -wLogos, it should be -w Logos
            return 1;   //Error 1, typo error
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
        var names = [];                                                 //Save given names
        for (let i = 0; i < args.length; i++) {                         //0 is for name and 1 is for size, start from 2
            var sim_name = GetSimilarName(client, args[i], message);    //
            if(sim_name != null){                                       //
                names.push(sim_name);                                   //fix typo errors
            }                                                           //
        }                                                               //

        var id = [];                                                //get whitelists users' id
        for (let i = 0; i < names.length; i++) {
            var temp = client.users.cache.find(user => user.username == names[i]);
            if(temp == null){
                message.channel.send("Il nome " + names[i] + " non esiste brutto dislessico di merda, lo skippo");
            }else{
                id.push(temp.id);
            }
        }

        return AddToWhiteList(channel, id, message);
    }

    GetIdByNames(args=[], client, message){
        var names = [];                                                 //Save given names
        for (let i = 0; i < args.length; i++) {                         //0 is for name and 1 is for size, start from 2
            var sim_name = GetSimilarName(client, args[i], message);    //
            if(sim_name != null){                                       //
                names.push(sim_name);                                   //fix typo errors
            }                                                           //
        }                                                               //

        var id = [];                                                //get whitelists users' id
        for (let i = 0; i < names.length; i++) {
            var temp = client.users.cache.find(user => user.username == names[i]);
            if(temp == null){
                message.channel.send("Il nome " + names[i] + " non esiste brutto dislessico di merda, lo skippo");
            }else{
                id.push(temp.id);
            }
        }

        return id;
    }

    RemoveWhiteList(args=[], channel, client, message){

        var id = [];
        id = this.GetIdByNames(args, client, message);

        return RemoveInWhiteList(channel, id, message);
    }

    HandleCommand(command, channel, client, message){
        var args = command.split(" ");
        switch(args[0]){
            case "a":
                //add inside whitelist

                var word = "";
                for(let i = 2; i < command.length; i++){
                    word += command.charAt(i);
                }
                var array_command = word.split(" ");
                var without = ArrayRemove(array_command, 0);
                without = ArrayRemove(array_command, array_command.length - 1);
                var added = this.AddWhiteList(without, channel, client, message);
                channel.setUserLimit(channel.userLimit + added);
                break;
            
            case "r":
                //Remove from whitelist and disconnect user

                var word = "";
                for(let i = 2; i < command.length; i++){
                    word += command.charAt(i);
                }
                var array_command = word.split(" ");
                var without = ArrayRemove(array_command, 0);
                without = ArrayRemove(array_command, array_command.length - 1);
                var removed = this.RemoveWhiteList(without, channel, client, message);
                
                channel.setUserLimit(channel.userLimit - removed);
                DisconnectUser(without, channel, client, message);
                
                break;

            case "n":
                var word = "";
                for(let i = 2; i < command.length; i++){
                    word += command.charAt(i);
                }
                channel.setName(word);
                break;
        }
    }
}

function DisconnectUser(without = [], voice_channel, client, message){
    var id = [];
    var r = new Rules();
    id = r.GetIdByNames(without, client, message);
    
    for(let i = 0; i < id.length; i++){
        var user = message.guild.members.cache.get(id[i]);
        user.voice.setChannel(null);
    }
    

}

function AddToWhiteList(channel, id = [], message){
    return global.UpdateWhiteList(channel.guild, channel.id, id, message);  //Add users to whitelist
}

function RemoveInWhiteList(channel, id = [], message){
    return global.RemoveUserWhiteList(channel.guild, channel.id, id, message);
}

function CheckSyntax(message, args ,client, channel){
    //#region Rule Syntax
        var rule = "";                                                  //
        size_pos = 0;
        for(let i = size_pos; i < args.length; i++){                    //Build rules in a string
            rule += args[i] + " ";                                      //
        }                                                               //
        var rules = [];
        rules = rule.split("-");                                        //split the sting for each - (sub_rule)
        rules = ArrayRemove(rules, 0);                                  //remove empty slot                       
        var r = new Rules(); 
        var error = false;
        rules.forEach(rule_line => {
            var result = r.IsRule(rule_line);                           //check rule syntax
            switch (result) {
                case 0:
                    //Everything is good
                    r.HandleCommand(rule_line, channel, client, message);
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

    //#endregion
}

module.exports = {
    name: 'editchannel',
    descriprion: "Edit ayour channel",
    execute(message, args, client){
        if(args[0] == null){
            message.channel.send("*Coglione, leggi come usare il comando");
            return;
        }

        var complete_command = "";
        for(let i = 0; i < args.length; i++){
            complete_command += args[i]+ " ";
        }
        console.log("complete : " + complete_command);
        var values = complete_command.split(" ");
        values = ArrayRemove(values, 0);
        
        for(let i = 0; i < values.length - 1; i++){
            console.log("Value read: " + values[i]);
            if(!isASCII(values[i])){
                message.channel.send("Ti piace proprio l'arte di rompere il cazzo eh? Accetto solo caratteri ASCII, tiè");
                return;
            }
            if(values[i].length > 100){
                message.channel.send("Guarda che la lunghezza del messaggio " +
                        "non è direttamente proporzionale alla lunghezza del cazzo, massimo 100 caratteri");
                return;
            }
            if(values[i].length < 1){
                message.channel.send("Si ma metti il nome e che cazzo");
                return;
            }
        }

        if(global.IsRanked(message.guild.id, message.member.voice.channel.id, function(){
            CheckSyntax(message, args, client, message.member.voice.channel);
        },function(){
            message.channel.send("Mi prendi per il culo? Vuoi cheattare? Devi essere in un canale privato per usare questo comando");
        } )){
        }
    }
}