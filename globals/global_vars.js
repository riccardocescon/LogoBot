global.fs = require('fs');
var qs = require('qs');
const axios = require('axios')
var FormData = require('form-data');
global.readline = require('readline');
global.path = "data.txt";

class Dictionary{
    key;                                                                //channel id
    value = [];                                                         //all names in whitelist

    SetKey(key){                                                        //
        this.key = key;                                                 //Set ranked channel
    }                                                                   //

    CheckUniqueValue(_value){
        for(let i = 0; i < this.value.length; i++){
            if(this.value[i] == _value)return false;
        }
        return true;
    }

    HasWhiteList(){
        for(let i = 0; i < this.value.length; i++){
            if(this.value[i] === '*')return false;
        }
        return true;
    }

    AddSingleIncapsulatedValue(value){
        if(this.CheckUniqueValue(value)){
            this.value.push(value);                                  //Add people to whitelist
        }  
    }

    AddIncapsuledValue(_key, values){                                            //
        this.key = _key;
        var success = 0;
        if(values == null){
            return success;
        }

        for(let i = 0; i < values.value.length; i++){
          if(this.CheckUniqueValue(values.value[i])){
                this.value.push(values.value[i]);                                  //Add people to whitelist
                success++;
            }  
        }
         
        return success;                                                 //
    }  

    AddValue(value, message){                                            //
        if(!Array.isArray(value)){
            this.value.push('*');
            return 0;
        }
        var success = 0;
        for(let i = 0; i < value.length; i++){                              //
            if(this.CheckUniqueValue(value[i])){
                this.value.push(value[i]);                                  //Add people to whitelist
                message.channel.send("User added to the whitelist");        //
                success++;
            }else{
                message.channel.send("User is already saved on the whitelist");
            }
        }   
        return success;                                                 //
    }                                                                   //

    AddValueLocal(value){                                            //
        var success = 0;
        if(this.CheckUniqueValue(value)){
            this.value.push(value);                                  //Add people to whitelist
            success++;
        } 
        return success;                                                 //
    }   

    RemoveValue(value=[], message){
        var success = 0;
        for(let i = 0; i < value.length; i++){                              //
            var index = value.indexOf(value[i]);
            if(index > -1){
                this.value.splice(index, 1);
                success++;
                message.channel.send("User deleted");
            }else{
                message.channel.send("Please check user name");
            }
        }
        return success; 
    }

    IsInWhiteList(name){                                                //
        for(let i = 0; i < this.value.length; i++){                     //
            if(this.value[i] === name)return true;                      //Check if the user is saved in the whitelist
        }                                                               //
        return false;                                                   //
    }                                                                   //
}

function GetStringID(server_id){
    var server_string = "";
    const len = Math.ceil(Math.log10(server_id + 1))
    for(let i = 0; i < len; i++){
        server_string += server_id.charAt(i);
    }
    return server_string;
}

global.Request = class Request{
    server_id;                                                          //Unique server's id
    channels = [];                                                      //Dictionary that saves ranked and whitelist Ex: Dictionary<int, List<int>> channels
    
    constructor(server_id, channel_id){                                             //
        this.server_id = server_id;
        console.log("Server id : " + server_id);
        console.log("Adding server : " + server_id.id + " channel : " + channel_id);
        if(channel_id == null){
            return;
        }
        //Save to database
        var ended = false;

        //Save server
        axios
        .post(
            'http://crart.altervista.org/discordbot/actions/register_server.php',
            qs.stringify({ 'server_id': server_id.id })
            
        )
        .then(res => {
            console.log(res.data)
            if(res.data == "0"){
                console.log("saving");
                this.SaveChannelToDatabase(server_id, channel_id);
            }
        })
        .catch(error => {
            console.error(error)
        })       
    }                                                                   //

    

    SaveBothToFile(server_id, channel_id){
        fs.appendFile(path, "{" + server_id +"}" , (err) =>{
            if(err)console.log(err);
            console.log("Server " + server_id + " added to data.txt");
            this.SaveToFile(server_id, channel_id);
        })
    }

    SaveToFile(server_id, channel_id){
        var servers = [];
        servers = this.GetFileDataToArray(server_id, channel_id, null);
        console.log(servers.length);
        //everything is saved inside dic. write it's content on a file and then overwrite the file
        this.WriteToFile(servers);
    }

    GetFileDataToArray(server_id, channel_id, names){
        console.log("--------------------------Getting data to string------------------------------------");
        var servers = [];
        var file = fs.readFileSync(path).toString().split("{");
        file = this.ArrayRemove(file, 0);
        console.log('\x1b[31mNumber of server saved : ' + file.length + '\x1b[0m');
        var added = false;
        for(let i = 0; i < file.length; i++){
            var incapsuled_server = this.GetFirstIncapsuled(file[i]);
            console.log("Analyzing server : " + incapsuled_server);
            var temp = file[i].split("[");
            var serv = new Dictionary();
            serv.SetKey(incapsuled_server);
            console.log("Number of channels saved : " + (temp.length - 1) );
            for(let j = 1; j < temp.length; j++){
                var incapsuled_channel = this.GetFirstIncapsuled(temp[j]);
                var chan = new Dictionary();
                var temp_whitelist = temp[j].split("(");
                var white_list = [];
                chan.SetKey(incapsuled_channel);
                console.log('\x1b[34mAnalyzing channel : ' + incapsuled_channel + '\x1b[0m');
                for(let x = 1; x < temp_whitelist.length; x++){
                    var incapsulated_whitelist = this.GetFirstIncapsuled(temp_whitelist[x]);
                    console.log('\x1b[32mAnalyzing whitelist : ' + incapsulated_whitelist + '\x1b[0m');
                    chan.AddSingleIncapsulatedValue(incapsulated_whitelist);
                }
                serv.AddSingleIncapsulatedValue(chan);

                if(!added && incapsuled_server == server_id){
                    //add new channel
                    var temp_c = new Dictionary();
                    temp_c.SetKey(channel_id);
                    console.log("ADDING NAMES: ");
                    if(names != null){
                        for(let p = 0; p < names.length; p++){
                            temp_c.AddSingleIncapsulatedValue(names[p]);
                        }
                       console.log("Same server, adding channel: " + channel_id + " with white n : " + names.length); 
                    }else{
                        console.log("Same server, adding channel: " + channel_id + " without whitelist");
                    }
                    added = true;
                    serv.AddSingleIncapsulatedValue(temp_c);
                }
            }

            console.log("Pre - summary : " );
            console.log("Adding server : " + serv.key);
            for(let u = 0; u < serv.value.length; u++){
                console.log("Adding chan : " + serv.value[u].key);
            }
            
            servers.push(serv);
        }

        console.log("Summary :");
        for(let i = 0; i < servers.length; i++){
            console.log("Server : " + servers[i].key + " constains : ");
            for(let j = 0; j < servers[i].value.length; j++){
                console.log("Channel : " + servers[i].value[j].key);
                for(let x = 0; x < servers[i].value[j].value.length; x++){
                    console.log("With whitelist : " + servers[i].value[j].value[x]);
                }
            }
        }

        return servers;
    }

    SaveWhiteList(server_id, channel_id, names){
    
        var servers = [];
        console.log("Saving new channel : " + channel_id + " and users : " + names.length);
        servers = this.GetFileDataToArray(server_id, channel_id, names);
        console.log("Added users to SaveWhiteList: " + names.length);
    }

    async WriteToFile(servers = []){
        console.log("----------------------Set File Writing------------------------------ : " + servers.length);
        //clear file
        fs.writeFile(path, "", (err) =>{
            if(err)console.log(err);
            console.log("File cleared");

            //add one server per time
            for(let i = 0; i < servers.length; i++){
                var current_server = servers[i];
                console.log('\x1b[36mServer key : ' + current_server.key + '\x1b[0m');
                var data = "";

                for(let j = 0; j < current_server.value.length; j++){
                    var current_channel = current_server.value[j];
                    console.log('\x1b[33mChanneld id : ' + current_channel.key + '\x1b[0m');
                    var white_string = "";

                    for(let x = 0; x < current_channel.value.length; x++){
                        console.log("Adding white : " + current_channel.value[x]);
                        white_string += "(" + current_channel.value[x] + ")";
                    }

                    data += "[" + current_channel.key + white_string + "]";
                    console.log('\x1b[35mUploading channel : ' + current_channel.key + '\x1b[0m');
                }

                fs.appendFile(path, "{" + current_server.key + data +"}" , (err) =>{
                    if(err)console.log(err);
                    console.log("Uploading server : " + "{" + current_server.key + data +"}");
                })
            }
        })
    }
    
    AddChannel(name, server){                                                   //Adds new ranked channel on the server
        var dic = new Dictionary();                                     //Create a new Dictionary
        dic.SetKey(name);                                               //Set the dictionary key (channel id)
        this.channels.push(dic);                                        //Save it

        //this.SaveToFile(server, name);

    }                                                                   //

    AddChannelLocal(name, users){                                       
        var dic = new Dictionary();                                     
        dic.SetKey(name);                             
        for(let i = 0; i < users.length; i++){
            dic.AddValueLocal(users[i]);
        }                  
        this.channels.push(dic);                                        
    }  

    ArrayRemove(array = [], pos){
        var res = [];
        for(let i = 0; i < pos; i++){
            res.push(array[i]);
        }
        for(let i = pos + 1; i < array.length; i++){
            res.push(array[i]);
        }
        return res;
    }

    IsNumber(value){
        var parsed = Number.parseInt(value, 10);
        if(Number.isNaN(parsed)){
            return false;
        }else{
            return true;
        }
    }

    GetFirstIncapsuled(line){
        var numbers = "";
        for(let i = 0; i < line.length; i++){
            if(this.IsNumber(line.charAt(i))){
                numbers += line.charAt(i);
            }else{
                return numbers;
            }
        }
        return numbers;
    }

    SaveChannel(server, channel_id){

        
        //Delete first element cause it's emoty

        /*const readInterface = readline.createInterface({
            input: fs.createReadStream(path),
            output: process.stdout,
            terminal: false
        });
        
        readInterface.on('line', function(line) {
            if(line == server){
                fs.appendFile(path, "[\n" + channel_id +"\n]\n" , (err) =>{
                    if(err)console.log(err);
                    console.log("Channel " + channel_id + " added to data.txt");
                })
                return;
            }
        });*/
    }

    AddWhiteListChannel(channeld_id, names, message, server_id){                       //Add people to the whitelist
        for(let i = 0; i < this.channels.length; i++){                  //Search the right channel (more than one could exists at the same time)
            if(this.channels[i].key == channeld_id){                    
                this.SaveWhiteList(server_id, channeld_id, names);
                return this.channels[i].AddValue(names, message);                //Save names to the whitelist
            }                                                           //
        }                                                               //
    }                                                                   //

    RemoveUserWhiteList(channel_id, names = [], message){
        for(let i = 0; i < this.channels.length; i++){                  //Search the right channel (more than one could exists at the same time)
            if(this.channels[i].key == channel_id){                    //
                return this.channels[i].RemoveValue(names, message);    //Remove names to the whitelist
            }                                                           //
        }  
    }

    GetRankedChannelListLength(){                                       //
        return this.channels.length;                                    //Get ranked channels' number
    }                                                                   //

    IsRanked(channel_id){                                               //Check is given channel is ranked
        for(let i = 0; i < this.channels.length; i++){                  //check every ranked channel in this server
            if(this.channels[i].key == channel_id){                     //if this matches
                return true;                                            //it's ranked
            }                                                           //
        }                                                               //
        return false;                                                   //otherwise it's not ranked
    }                                                                   //

    GetWhiteListLength(channel_id){                                     //
        for(let i = 0; i < this.channels.length; i++){                  //
            if(this.channels[i].key == channel_id){                     //
                return this.channels[i].value.length;                   //Get poeple on whitelists' number
            }                                                           //
        }                                                               //
    }                                                                   //

    IsInWhiteList(channel_id, name){                                    //Check if given user is saved in the whitelist
        for(let i = 0; i < this.channels.length; i++){                  //switch through all ranked channels
            if(this.channels[i].key == channel_id){                     //if this matches
                return this.channels[i].IsInWhiteList(name);            //check if name is saved inside the whitelist
            }                                                           //
        }                                                               //
    }                                                                   //

    HasWhiteList(channel_id){                                           //Check has whitelist
        for(let i = 0; i < this.channels.length; i++){                  //
            if(this.channels[i].key == channel_id){                     //
                return this.channels[i].HasWhiteList();                 //
            }                                                           //
        }                                                               //
    }  
}                                                                       //

function SaveServerChannelToDatabase(server_id, channel_id, _callback){
    console.log('\x1b[36mSaving server : \x1b[0m');
    axios
    .post(
        'http://crart.altervista.org/discordbot/actions/register_server.php',
        qs.stringify({ 'server_id': server_id.id })
        
    )
    .then(res => {
        console.log("received : " + res.data)
        if(res.data == "0"){
            SaveChannelToDatabase(server_id, channel_id, _callback);
        }
    })
    .catch(error => {
        console.error(error)
    })       
}

function SaveChannelToDatabase(server_id, channel_id, _callback){
    console.log('\x1b[36mSaving Channel : \x1b[0m');
    axios({
        method: 'post',
        url: 'http://crart.altervista.org/discordbot/actions/register_channel.php',
        data: qs.stringify({
            server_id : server_id.id,
            channel_id : channel_id
        })
    })
    .then(res => {
        console.log("got channel : " + res.data)
        _callback();
    })
    .catch(error => {
        console.error(error)
    })
}

function IsNumber(value){
    var parsed = Number.parseInt(value, 10);
    if(Number.isNaN(parsed)){
        return false;
    }else{
        return true;
    }
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

function GetFirstIncapsuled(line){
    var numbers = "";
    for(let i = 0; i < line.length; i++){
        if(IsNumber(line.charAt(i))){
            numbers += line.charAt(i);
        }else{
            return numbers;
        }
    }
    return numbers;
}

global.requests = [];                                                   //Saves every server that has created at least 1 ranked channel

global.LoadRequests = function LoadRequests(){
    requests = [];
    var file = fs.readFileSync(path).toString().split("{");     //Getting servers
    file = ArrayRemove(file, 0);
    for(let i = 0; i < file.length; i++){
        var incapsuled_server = GetFirstIncapsuled(file[i]);
        var temp = file[i].split("[");                          //Getting servers' channels
        var req = new Request(incapsuled_server, null);
        for(let j = 1; j < temp.length; j++){
            var incapsuled_channel = GetFirstIncapsuled(temp[j]);
            var incapsulated_whitelist = [];
            var temp_white = temp[j].split("(");                //Getting channels' whitelist
            for(let x = 1; x < temp_white.length; x++){
                incapsulated_whitelist.push(GetFirstIncapsuled(temp_white[x]));
            }
            req.AddChannelLocal(incapsuled_channel, incapsulated_whitelist);
        }

        /*console.log("Summary (Load to requests):");
        console.log("Adding server : " + req.server_id);
        for(let x = 0; x < req.channels.length; x++){
            console.log("channel : " + req.channels[x].key);
            for(let y = 0; y < req.channels[x].value.length; y++){
                console.log("whitelist : " + req.channels[x].value[y]);
            }
        }*/

        requests.push(req);
    }
}

global.GetRequest = function GetRequest(server_id, channel_id, _callback){                                 //Get server data by server id
    //fai le tue cose

    _callback();


    axios
    .post(
        'http://crart.altervista.org/discordbot/actions/checkserver.php',
        qs.stringify({ 'server_id': server_id.id })
        
    )
    .then(res => {
        console.log(res.data)
        if(res.data == "0"){
            console.log("saving server and channel");
            SaveServerChannelToDatabase(server_id, channel_id, _callback);
            //
            /*var new_server = new Request(server_id, channel_id);                                        //
            global.requests.push(new_server);                                               //
            return new_server;*/
            return false;
        }else{
            console.log("Server exists, saving channel");
            SaveChannelToDatabase(server_id, channel_id, _callback);
            return true;
        }
    })
    .catch(error => {
        console.error(error)
    })                                                                    //
}                                                                                   //

global.AddRankedChannel = function AddRankedChannel(server_id, name){               //Add new Ranked channel
    for(let i = 0; i < global.requests.length; i++){                                //Search for the given server
        if(global.requests[i].server_id == server_id){                              //
            //console.log("Adding ranked : " + name);
            global.requests[i].AddChannel(name, server_id);                                    //Register server
        }                                                                           //
    }                                                                               //
}                                                                                   //

    //Add user to a ranked channel
global.UpdateWhiteList = function UpdateWhiteList(server_id, channel_id ,names, message){ //Add user to a ranked channel
    console.log('\x1b[36mSaving whitelist : \x1b[0m');
    CheckServer(server_id, channel_id ,function(){
        axios({
            method: 'post',
            url: 'http://crart.altervista.org/discordbot/actions/add_whitelist.php',
            data: qs.stringify({
                server_id : server_id.id,
                channel_id : channel_id,
                ids : names
            })
        })
        .then(res => {
            console.log("got added : " + res.data)
            
        })
        .catch(error => {
            console.error(error)
        })
    });             

    
    /*for(let i = 0; i < global.requests.length; i++){                                //Search for the given server  
        if(global.requests[i].server_id == server_id){                              //
            return global.requests[i].AddWhiteListChannel(channel_id, names, message, server_id);       //Add user to the ranked channel's whitelist
        }                                                                           //
    }*/                                                                               //
}                                                                                   //

global.RemoveUserWhiteList = function RemoveUserWhiteList(server_id, channel_id ,names=[], message){ //Add user to a ranked channel
    
    console.log('\x1b[36mRemove from whitelist : \x1b[0m');
    CheckServer(server_id, channel_id, function(){
        axios({
            method: 'post',
            url: 'http://crart.altervista.org/discordbot/actions/removewhitelist.php',
            data: qs.stringify({
                server_id : server_id.id,
                channel_id : channel_id,
                ids : names
            })
        })
        .then(result => {
            console.log("got removed: " + result.data)
            if(result.data == "0"){
                console.log("removed");
            }
            
        })
        .catch(error => {
            console.error(error)
        })
    });               
    
    /*for(let i = 0; i < global.requests.length; i++){                                //Search for the given server  
        if(global.requests[i].server_id == server_id){                              //
            RemoveUserFromWhiteilstDatabase();
            //return global.requests[i].RemoveUserWhiteList(channel_id, names, message);       //Add user to the ranked channel's whitelist
        }                                                                           //
    }*/                                                                               //
} 

global.GetRankedChannelListLength = function GetRankedChannelListLength(server_id){ //Get Ranked channel list length
    for(let i = 0; i < global.requests.length; i++){                                //Search for the given server
        if(global.requests[i].server_id == server_id){                              //
            return global.requests[i].GetRankedChannelListLength();                 //return it's length
        }                                                                           //
    }                                                                               //
}                                                                                   //

global.IsRanked = function IsRanked(server_id, channel_id, _callback_ranked, _callback_not_ranked){                         //Check if given channel is ranked
    
    CheckServer(server_id, channel_id ,function(){
        axios({
            method: 'post',
            url: 'http://crart.altervista.org/discordbot/actions/checkserverchannel.php',
            data: qs.stringify({
                server_id : server_id.id,
                channel_id : channel_id
            })
        })
        .then(result => {
            console.log("got ranked : " + result.data)
            if(result.data == "0"){
                if(_callback_ranked != null)
                _callback_ranked();
            }else{
                //isn't ranked
                if(_callback_not_ranked != null)
                _callback_not_ranked();
            }
            
        })
        .catch(error => {
            console.error(error)
        })
    })

    /*for(let i = 0; i < global.requests.length; i++){                                //Search for the given server
        if(global.requests[i].server_id == server_id){                              //
            return global.requests[i].IsRanked(channel_id);                         //Check if it's ranked
        }                                                                           //
    }*/                                                                               //
}                                                                                   //

function CheckServer(server_id, channel_id, _callback){
    axios
    .post(
        'http://crart.altervista.org/discordbot/actions/checkserver.php',
        qs.stringify({ 'server_id': server_id.id })
        
    )
    .then(res => {
        if(res.data == "0"){
            console.log("Server does not exists");
        }else{
            _callback();
        }
    })
    .catch(error => {
        console.error(error)
    })
}

global.GetWhiteListLength = function GetWhiteListLength(server_id, channel_id){ //Get Whitelist channel list length
    for(let i = 0; i < global.requests.length; i++){                                    //Search for the given server
        if(global.requests[i].server_id == server_id){                                  //
            return global.requests[i].GetWhiteListLength(channel_id);                   //return it's length
        }                                                                               //
    }                                                                                   //
}                                                                                       //

global.IsInWhiteList = function IsInWhiteList(server_id, channel_id, name, _callback){             //Check if user is in whitelist
    console.log("Checking whitelist : " + name);
    return CheckServer(server_id, channel_id, function(){
        axios({
            method: 'post',
            url: 'http://crart.altervista.org/discordbot/actions/checkwhitelist.php',
            data: qs.stringify({
                server_id : server_id.id,
                channel_id : channel_id,
                user_id : name 
            })
        })
        .then(res => {
            if(res.data == "0"){
                console.log("User found");
                return true;
            }else{
                console.log("User not found");
                _callback();
            }
        })
        .catch(error => {
            console.error(error)
        })
    });

    /*for(let i = 0; i < global.requests.length; i++){                                    //search for the given server
        if(global.requests[i].server_id == server_id){                                  //
            return global.requests[i].IsInWhiteList(channel_id, name);                  //Search the right channel and check for user whitelist
        }                                                                               //
    }*/                                                                                   //
}                                                                                       //

global.HasWhiteList = function HasWhiteList(server_id, channel_id){
    for(let i = 0; i < global.requests.length; i++){                                    //search for the given server
        if(global.requests[i].server_id == server_id){                                  //
            return global.requests[i].HasWhiteList(channel_id);                         //Search the right channel and check for user whitelist
        }                                                                               //
    } 
}


