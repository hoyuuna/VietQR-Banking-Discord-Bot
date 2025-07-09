const { Client, GatewayIntentBits, Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const qrcode = require('qrcode');
const { crc16ccitt } = require('crc');
require('dotenv').config();

const { DISCORD_TOKEN, BANK_BIN, BANK_NAME, ACCOUNT_NO, ACCOUNT_NAME, AUTHORIZED_USERS, PREFIX } = process.env;
const authorizedUsers = AUTHORIZED_USERS ? AUTHORIZED_USERS.split(',') : [];

function buildTLV(tag, value) {
    const sTag = tag.toString().padStart(2, '0');
    const sLength = value.length.toString().padStart(2, '0');
    return `${sTag}${sLength}${value}`;
}

function generateQRString(amount, message) {
    const payloadFormat = buildTLV('00', '01');
    const pointOfInitiation = buildTLV('01', '12');
    const guid = buildTLV('00', 'A000000727');
    const service = buildTLV('02', 'QRIBFTTA');
    const bankBin = buildTLV('00', BANK_BIN);
    const accountNumber = buildTLV('01', ACCOUNT_NO);
    const consumerInfo = buildTLV('01', `${bankBin}${accountNumber}`);
    const merchantAccountInfo = buildTLV('38', `${guid}${consumerInfo}${service}`);
    const transactionCurrency = buildTLV('53', '704');
    const transactionAmount = buildTLV('54', amount.toString());
    const countryCode = buildTLV('58', 'VN');
    const sanitizedMessage = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    const purposeOfTransaction = buildTLV('08', sanitizedMessage);
    const additionalData = buildTLV('62', purposeOfTransaction);
    const payloadToCRC = `${payloadFormat}${pointOfInitiation}${merchantAccountInfo}${transactionCurrency}${transactionAmount}${countryCode}${additionalData}6304`;
    const crc = crc16ccitt(payloadToCRC).toString(16).toUpperCase().padStart(4, '0');
    return `${payloadToCRC}${crc}`;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, c => {
    console.log(`✅ Đã sẵn sàng! Đăng nhập với tên ${c.user.tag}`);
    console.log(`🏦 Ngân hàng: ${BANK_NAME || BANK_BIN} - STK: ${ACCOUNT_NO}`);
    console.log(`⚙️  Tiền tố lệnh (Prefix): ${PREFIX}`);
    console.log(`👥 Các user được phép: ${authorizedUsers.join(', ')}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    if (!authorizedUsers.includes(message.author.id)) {
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'pay') {
        try {
            if (!args[0]) {
                const replyMsg = await message.reply('⚠️ Vui lòng nhập số tiền. Ví dụ: `!pay 20000`');
                setTimeout(() => replyMsg.delete(), 5000);
                return;
            }

            const amount = parseInt(args[0]);
            if (isNaN(amount)) {
                const replyMsg = await message.reply('⚠️ Số tiền không hợp lệ. Vui lòng chỉ nhập số.');
                setTimeout(() => replyMsg.delete(), 5000);
                return;
            }

            if (amount < 5000 || amount > 99999999) {
                const replyMsg = await message.reply('⚠️ Số tiền phải từ `5,000` đến `99,999,999` VND.');
                setTimeout(() => replyMsg.delete(), 5000);
                return;
            }

            let content = args.slice(1).join(' ');
            if (!content) {
                content = `Chuyen khoan ${amount}`;
            }

            const qrString = generateQRString(amount, content);
            const qrImageBuffer = await qrcode.toBuffer(qrString, { scale: 8 });
            const attachment = new AttachmentBuilder(qrImageBuffer, { name: 'vietqr.png' });

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📱 THANH TOÁN CHUYỂN KHOẢN')
                .setDescription('Vui lòng quét mã QR để thanh toán')
                .addFields(
                    { name: '🏦 Ngân hàng', value: `\`${BANK_NAME || BANK_BIN}\`` },
                    { name: '👤 Chủ tài khoản', value: `\`${ACCOUNT_NAME}\`` },
                    { name: '💳 Số tài khoản', value: `\`${ACCOUNT_NO}\`` },
                    { name: '💰 Số tiền', value: `\`${amount.toLocaleString('vi-VN')} VND\`` },
                    { name: 'ℹ️ Nội dung', value: `\`${content}\`` }
                )
                .setImage('attachment://vietqr.png')
                .setTimestamp()
                .setFooter({ text: `Xin cảm ơn!` });

            await message.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error('Lỗi khi tạo QR:', error);
            const replyMsg = await message.reply('❌ Đã xảy ra lỗi khi tạo mã QR. Vui lòng thử lại.');
            setTimeout(() => replyMsg.delete(), 5000);
        }
    }
});

client.login(DISCORD_TOKEN);
