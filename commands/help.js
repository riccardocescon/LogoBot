
function ShowHelp(message, args, Discord){
    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281')
                        .setTitle('Help')
                        .setDescription('I comandi disponibili attualmente sono :')
                        .addFields(
                            {name: 'setchannel (sc)', value: 'Puoi creare un canale privato temporaneo(Es. ranked).\nSi autodistruggerà quando non ci sarà nessuno dentro'},
                            {name: 'editchannel (ec)', value: 'Modifica le regole del server privato'},
                            {name: 'clear (c)', value: 'Pulisci la chat'},
                            {name: 'help (h)', value: 'Impara ad usare i comandi. Scrivi *help [command] per avere più informazioni'},
                        )
                        .setImage('https://image.shutterstock.com/image-vector/dabbing-unicorn-stars-260nw-1059886088.jpg');
        message.channel.send(newEmbed);
}

function ShowSetChannel(message, args, Discord){
    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281')
                        .setTitle('Set Channel')
                        .setDescription('Puoi creare un canale privato temporaneo (Es. ranked).\n' +
                        'Il canale si autodistruggerà quando non ci sarà nessuno dentro.\n\n')
                        .addFields(
                            {
                                name: "Sintassi : *setchannel [channel_name] [limit] [rules]\n\n",
                                value:'channel_name = Nome del canale da creare\n' +
                                'limit = Numer massimo delle persone nel canale (lascia vuoto se non vuoi un limite)\n' +
                                "rules = Le regole sono formate da un 'attributo' e da 'inforamtions'.\n" + 
                                "Se non metti le regole chiunque potrà entrare nel canale finchè ci sarà spazio" +
                                '   informations = nome degli utenti nel server\n'
                            },
                            {
                                name:'Attributes: ',
                                value: 'lists:'
                            },
                        )
                        .addFields(
                            {
                                name: '-w', 
                                value: 'whitelist : Puoi aggiugnere persone alla whitelist per farle entrare nel canale\n' +
                                        'Puoi evitare di inserire il limite mettendo la whitelist' +
                                        'Ex: *sc Ranked -w Logos McStecca\n' 
                            },
                        )
                        .setImage('https://i.pinimg.com/originals/f5/84/d6/f584d6fe0d5173d717d1671bfa3f0d14.jpg');
        message.channel.send(newEmbed);
}

function ShowEditChannel(message, args, Discord){
    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281')
                        .setTitle('Edit Channel')
                        .setDescription('Puoi modificare le regole del server privato.\n')
                        .addFields(
                            {
                                name: "Sintassi : *editchannel [rules]\n\n",
                                value:"rules = Le regole sono formate da un 'attributo' e da 'inforamtions'\n" + 
                                '   informations = nome degli utenti nel server\n'
                            },
                            {
                                name:'Attributes: ',
                                value: 'lists:'
                            },
                        )
                        .addFields(
                            {
                                name: '-a', 
                                value: 'Add : Puoi aggiugnere utenti alla whitelist per farle entrare nel canale\n' +
                                        'Il canale adeguerà in automatico il limite massimo\n' +
                                        'Ex: *ec -a Baldnoah Nik'
                            },
                            {
                                name: '-r',
                                value: 'Remove : Puoi rimuovere utenti dalla whitelist per evitare che entrino nel canale\n' +
                                        'Se gli utenti si trovano dentro al canale, verranno immediatamente buttati fuori\n' +
                                        'Ex: *ec -r Logos Baldnoah'
                            },
                            {
                                name: '-n',
                                value: 'Name : Puoi rinominare il canale privato in cui ti trovi\n' +
                                        'Ex: *ec -n Rocket League'
                            },
                        )
                        .setImage('https://ih1.redbubble.net/image.580138596.8470/flat,750x1000,075,f.u3.jpg');
        message.channel.send(newEmbed);
}

function ShowClear(message, args, Discord){
    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281')
                        .setTitle('Clear')
                        .setDescription('Puoi eliminare dei messaggi nel canali testuali se sono stati inviati entro 14 giorni.\n')
                        .addFields(
                            {
                                name: "Sintassi : *clear [amount]\n\n",
                                value:"amount = numero di messaggi da eliminare (max 100 per volta)"
                            },
                        )
                        .addFields(
                            {
                                name: 'Esempio', 
                                value: '*c 40'
                            },
                        )
                        .setImage('https://res.cloudinary.com/teepublic/image/private/s--oYC0yszz--/c_fit,g_north_west,h_840,w_751/co_000000,e_outline:40/co_000000,e_outline:inner_fill:1/co_ffffff,e_outline:40/co_ffffff,e_outline:inner_fill:1/co_bbbbbb,e_outline:3:1000/c_mpad,g_center,h_1260,w_1260/b_rgb:eeeeee/c_limit,f_jpg,h_630,q_90,w_630/v1589025171/production/designs/9964245_0.jpg');
        message.channel.send(newEmbed);
}

function AnalyzeSyntax(message, args, Discord){
    if(args[0] == null){
        ShowHelp(message, args, Discord);
        return;
    }

    if(args.length > 1){
        message.channel.send("Un messaggio alla volta");
        return;
    }

    switch(args[0]){
        case "setchannel":
        case "sc":
            ShowSetChannel(message, args, Discord);
            break;

        case "editchannel":
        case "ec":
            ShowEditChannel(message, args, Discord);
            break;
        
        case "clear":
        case "c":
            ShowClear(message, args, Discord);
            break;
        
        default:
            message.channel.send("Quel comando non esiste");
            break;
        
    }
}

module.exports = {
    name: 'help',
    descriprion: "Help with commands!",
    execute(message, args, Discord){
        AnalyzeSyntax(message, args, Discord);
    }
}