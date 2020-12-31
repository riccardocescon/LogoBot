module.exports = {
    name: 'ping',
    descriprion: "this is a ping command!",

    execute(message, args){

        let role = message.guild.roles.cache.find(r => r.name === "Gay");

        if(message.member.roles.cache.some(r => r.name === "Gay")){
            message.channel.send('pong');
        }else{
            message.channel.send('Non puoi inviare questo messaggio perchè non sei abbastanza Gay');
            message.member.roles.add(role).catch(console.error);
            message.channel.send('Ti ho appena reso Gay, ringraziami puttanella');
        }
        
    }
}