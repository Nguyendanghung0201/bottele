// '7781678017:AAG6VGfSOy73KzsSu_mWZ8lcf2H6hSJM7DY';
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
 const K3_go_1p = require("./82com/auto82/k3_go_1p_82");

const token = '7781678017:AAG6VGfSOy73KzsSu_mWZ8lcf2H6hSJM7DY';
const adminGroup = require('./82com/admingroup_82');
console.log(" ------------------- bắt đầu bot K3GO 88lotte---------------------------")
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const axios = require("axios")
const replyMarkup = {
    keyboard: [
        [
            'Bắt đầu',
            'Cài DCA Thua'
        ],
        [
            "Đăng Nhập",
            "Cài Ngược",
            "Chốt lời/lỗ"
        ],
        [
            "Chiến lược",
            "Bật copy",
            "Lịch sử"
        ],
        [
            "Cài công thức",
            "Bật đợi gãy"
        ]

    ],

};
// Listen for any kind of message. There are different kinds of
// messages.
// const help = require('./82com/help82/k3gohelp_82')
// const Res = require("./json_82");
bot.on('channel_post', (msg) => {
    if (msg.text == '/check id') {
        bot.sendMessage(msg.chat.id, "ID group là " + msg.chat.id)
    }

});
bot.on('message', async (msg) => {

    let type = msg.chat?.type
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    // send a message to the chat acknowledging receipt of their message
    let text = msg.text ? msg.text : false

    if (type == 'group' || type == "supergroup") {
        if (text) {

            let check = text[0]
            if (check == '/') {
                let array = text.split("\n")
                let key_work = array[0]
                if (key_work == '/check id') {
                    return bot.sendMessage(chatId, "ID group là " + chatId, {
                        reply_to_message_id: messageId
                    })
                }
            }
            // chatId ==-1001899737741 &&
            if (chatId == -1002366640212 && (check == '/' || check == "A")) {

                return adminGroup.admingroup(chatId, msg, text, bot, messageId, "users_telegram_k3go", "copytinhieu_k3g88")
            }
        }
        return

    }


});


 K3_go_1p.runbot(bot)

//index_k3go_lotte