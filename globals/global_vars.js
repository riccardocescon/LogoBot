global.fs = require('fs');
var qs = require('qs');
const axios = require('axios')
var FormData = require('form-data');
global.readline = require('readline');
global.path = "data.txt";

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

global.GetRequest = function GetRequest(server_id, channel_id, _callback){                                 //Get server data by server id
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
            return false;
        }else{
            console.log("Server exists, saving channel");
            SaveChannelToDatabase(server_id, channel_id, _callback);
            return true;
        }
    })
    .catch(error => {
        console.error(error)
    })
}

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
}

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
} 

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
}

function CheckServer(server_id, channel_id, _callback){
    axios
    .post(
        'http://crart.altervista.org/discordbot/actions/checkserver.php',
        qs.stringify({ 'server_id': server_id.id })
        
    )
    .then(res => {
        if(res.data == "0"){
        }else{
            _callback();
        }
    })
    .catch(error => {
        console.error(error)
    })
}


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
}
