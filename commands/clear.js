module.exports = {
    name: 'clear',
    description: "Clear messages!",
    async execute(message, args){

        const parsed = Number.parseInt(args[0], 10);
        if (Number.isNaN(parsed)) {
            message.channel.send("Testa di cazzo, deve essere un numero");
            return;
        }

        if(!parsed)return message.reply("Coglione specifica quanti messaggi vuoi eliminare");
        if(isNaN(parsed))return message.reply("Frocio, devi mettere un numero");

        if(parsed > 100)return message.reply("Non rompere i coglioni, il massimo  100");
        if(parsed < 1)return message.reply("Ma allora non capisci proprio un cazzo, devi eliminarne almeno 1");

        await message.channel.messages.fetch({limit: parsed}).then(messages =>{
            message.channel.bulkDelete(messages, true)
        });
    }
}