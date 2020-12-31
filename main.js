const Discord = require('discord.js');
const axios = require('axios')
var qs = require('qs');

const client = new Discord.Client();

const prefix = '*';

const fs = require('fs');
const path = "data.txt";

client.command = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.command.set(command.name, command);
}

client.once('ready', ()=>{
    console.log('LogoBot is online');
    const variable = require('./globals/global_vars.js');
    variable.names = "pr";

    //global.LoadRequests();
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot)return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping'){
        client.command.get('ping').execute(message, args);
    }else if(command === 'command'){
        client.command.get('command').execute(message, args, Discord);
    }else if(command === 'clear'  || command === 'c'){
        client.command.get('clear').execute(message, args);
    }else if(command === 'setchannel' || command === 'sc'){
        client.command.get('setchannel').execute(message, args, client);
    }else if(command === 'editchannel' || command === 'ec'){
        client.command.get('editchannel').execute(message, args, client);
        //client.command.get('clear').execute(message, "1");
    }else if(command === 'deletechannel' || command === 'dc'){
        client.command.get('deletechannel').execute(message, args);
    }else if(command === 'help' || command === 'h'){
        client.command.get('help').execute(message, args, Discord);
    }

});

client.on('voiceStateUpdate', (oldState, newState) => {

    if(newState.channel == null)return;

    //Get server id
    let server_id = newState.channel.guild;
    let channel_id = newState.channel.id;

    let old_server_id = null;
    let old_channel_id = null;
    if(oldState.channel != null){
        old_server_id = oldState.channel.guild;
        old_channel_id = oldState.channel.id;
    }
    
    

    if(old_channel_id != null && newState.channelID != oldState.channelID){ //quitted
        if(global.IsRanked(old_server_id, old_channel_id, function(){
            //Check chanel users' number
            if(oldState.channel.members.size == 0){
                axios({
                    method: 'post',
                    url: 'http://crart.altervista.org/discordbot/actions/deletechannel.php',
                    data: qs.stringify({
                        server_id : server_id.id,
                        channel_id : oldState.channel.id
                    })
                })
                .then(result => {
                    console.log("got removed lol : " + result.data)
                    if(result.data == "0"){
                        console.log("removed channel");
                        oldState.channel.delete();
                        return;
                    }
                    
                })
                .catch(error => {
                    console.error(error)
                })
            }
        })){
        }

    }else if(oldState.channelID == newState.channelID){//muted or unmuted

    }else{  //Joined in this channel

    }

    //Check this channel is ranked
    //var ranked_list_length = global.GetRankedChannelListLength(server_id);

    //if(ranked_list_length == 0){return;}
    if(!global.IsRanked(server_id, channel_id, function(){
        //Check whitelist
        if(/*global.HasWhiteList(server_id, channel_id)*/true){
            var id = newState.member.id;
            if(!global.IsInWhiteList(server_id, channel_id, id, function(){
                 newState.setChannel(null);
            })){
            }
        }else{

        }
    })){
    }
    
  })



client.login('NzEyNjU2NjMzMzMwOTI1NzAw.XsUvNQ.ZTfrGDWQo-ZgMAQGjS-f3SekC74');