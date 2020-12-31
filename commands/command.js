module.exports = {
    name: 'command',
    descriprion: "Embends!",
    execute(message, args, Discord){
        const newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281')
                        .setTitle('Rules')
                        .setURL('https://youtube.com')
                        .setDescription('Questo è un embed per le regole')
                        .addFields(
                            {name: 'Regola 1', value: 'Non essere coglione'},
                            {name: 'Regola 2', value: 'Non rompere i coglioni'},
                            {name: 'Regola 3', value: 'Bara è un coglione'},
                        )
                        .setImage('https://image.shutterstock.com/image-vector/dabbing-unicorn-stars-260nw-1059886088.jpg')
                        .setFooter("Ricordati di leggere le regole del canale");
    
        message.channel.send(newEmbed);
    }
}