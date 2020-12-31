module.exports = {
    name: 'deletechannel',
    descriprion: "Delete a channel",
    execute(message, args){

        if(args[0] === "*"){
            let cont = 0;
            let size = message.guild.channels.cache.array().length;
            message.guild.channels.cache.array().forEach(chan => {
                if(cont < size){
                    chan.delete();
                    cont++;
                }
            });
            return;
        }

        const name = args[0];

        const fetchedChannel = message.guild.channels.cache.find(r => r.name === name);
        fetchedChannel.delete();
    
        message.channel.send("Canale eliminato");
    }
}