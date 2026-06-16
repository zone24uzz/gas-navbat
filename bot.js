import TelegramBot from 'node-telegram-bot-api';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8760531543:AAG_8CM9ImuUsRaJFeAMU17IvyNcxPd5Bkg';

let bot = null;
let users = [];
let refuelHistory = [];
let notificationsMap = null;
let getQueueFn = null;
let getStationQueuesFn = null;
let saveUsersFn = null;
let findUserByPhoneFn = null;
let confirmArrivalFn = null;
let markVerifiedFn = null;

// chatId → phone (linked phone, one-time use)
const chatToPhone = new Map();

export function initBot(_users, _refuelHistory, _notificationsMap, _getQueueFn, _getStationQueuesFn, _saveUsersFn, _findUserByPhoneFn, _confirmArrivalFn, _markVerifiedFn) {
  users = _users;
  refuelHistory = _refuelHistory;
  notificationsMap = _notificationsMap;
  getQueueFn = _getQueueFn;
  getStationQueuesFn = _getStationQueuesFn;
  saveUsersFn = _saveUsersFn;
  findUserByPhoneFn = _findUserByPhoneFn;
  confirmArrivalFn = _confirmArrivalFn;
  markVerifiedFn = _markVerifiedFn || null;

  // Rebuild mapping from users (legacy)
  chatToPhone.clear();
  users.forEach(u => {
    if (u.telegramChatId) chatToPhone.set(String(u.telegramChatId), u.phone);
  });

  bot = new TelegramBot(TOKEN, { polling: true });

  bot.on('polling_error', (err) => {
    console.error('🤖 Telegram polling error:', err?.message || err);
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'arrived_yes' || data === 'arrived_no') {
      await bot.answerCallbackQuery(query.id, { text: data === 'arrived_yes' ? '✅ Подтверждено' : '❌ Отменено' });
      const phone = chatToPhone.get(String(chatId));
      if (!phone) {
        await bot.sendMessage(chatId, '❌ Телефон не привязан. Используйте /link');
        return;
      }
      const found = findUserByPhoneFn ? findUserByPhoneFn(phone) : null;
      if (!found) {
        await bot.sendMessage(chatId, '❌ Вы не найдены в очереди.');
        return;
      }
      // Call confirmArrival with the user id
      if (confirmArrivalFn) {
        confirmArrivalFn(found.user.id, data === 'arrived_yes');
      }
      if (data === 'arrived_yes') {
        await bot.sendMessage(chatId, '✅ Отлично! Подойдите к заправке.');
      } else {
        await bot.sendMessage(chatId, '❌ Ваша очередь отменена.');
        // Unlink phone after use
        chatToPhone.delete(String(chatId));
        // Also remove from user if exists
        const user = users.find(u => u.phone === phone);
        if (user) {
          delete user.telegramChatId;
          if (saveUsersFn) saveUsersFn();
        }
        // Remove user message with keyboard
        await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      }
      return;
    }

    bot.answerCallbackQuery(query.id).catch(() => {});
  });

  console.log('🤖 Telegram bot started');

  // ── /start ─────────────────────────────────────────────
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const already = chatToPhone.has(String(chatId));
    bot.sendMessage(chatId,
      `👋 *GazQueue Botiga xush kelibsiz!*\n\n` +
      (already
        ? `✅ Telefon raqamingiz ulangan.\n`
        : `🔗 Telefon raqamingizni ulang:\n\`/link +998XXXXXXXXX\`\n\n`) +
      `📋 *Buyruqlar:*\n` +
      `🔹 \`/link +998XXXXXXXXX\` — Telefonni ulash (bir martalik)\n` +
      `🔹 \`/unlink\` — Telefonni uzish\n` +
      `🔹 \`/queue\` — Navbatdagi o'rningiz\n` +
      `🔹 \`/history\` — So'nggi 10 ta zapravka\n` +
      `🔹 \`/notifications\` — Bildirishnomalar\n` +
      `🔹 \`/start\` — Bu xabar`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /link ──────────────────────────────────────────────
  bot.onText(/\/link\s*(.+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const phoneRaw = match[1] ? match[1].replace(/[\s\-\(\)]/g, '') : '';
    if (!phoneRaw) {
      return bot.sendMessage(chatId,
        '❌ Telefon raqamni kiriting:\n`/link +998901234567`',
        { parse_mode: 'Markdown' }
      );
    }
    let phone = phoneRaw;
    if (!phone.startsWith('+')) phone = '+' + phone;
    if (!phone.startsWith('+998')) phone = '+998' + phone.replace(/^\+?998?/, '');

    // Check if phone is already linked with another chat
    for (const [existingChat, existingPhone] of chatToPhone) {
      if (existingPhone === phone) {
        return bot.sendMessage(chatId,
          '❌ Bu telefon raqam allaqachon boshqa chatda ulangan. Avval /unlink qiling.'
        );
      }
    }

    // Check if this phone is in any queue (main or station)
    const found = findUserByPhoneFn ? findUserByPhoneFn(phone) : null;
    if (!found) {
      return bot.sendMessage(chatId,
        '❌ Bu raqam bilan navbatda turgan foydalanuvchi topilmadi.\n' +
        'Avval saytda navbatga yoziling: http://localhost:5173/'
      );
    }

    // Link phone to this chat (one-time)
    chatToPhone.set(String(chatId), phone);

    // Also save in users list for legacy support
    let user = users.find(u => u.phone === phone);
    if (!user) {
      user = { id: found.user.id, phone, name: phone, createdAt: new Date().toISOString() };
      users.push(user);
    }
    user.telegramChatId = String(chatId);
    if (saveUsersFn) saveUsersFn();
    if (markVerifiedFn) markVerifiedFn(phone);

    bot.sendMessage(chatId,
      `✅ *Telefon ulandi!*\n\n` +
      `Tel: ${phone}\n` +
      `Navbatdagi o'rin: #${found.idx + 1}\n` +
      `Stansiya: ${found.stationId || 'Asosiy navbat'}\n\n` +
      `⚠️ Bu bir martalik ulash. Navbat tugagandan so'ng avtomatik uziladi.\n` +
      `Endi navbat haqida bildirishnomalar olasiz!`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── /unlink ────────────────────────────────────────────
  bot.onText(/\/unlink/, (msg) => {
    const chatId = msg.chat.id;
    const phone = chatToPhone.get(String(chatId));
    if (!phone) {
      return bot.sendMessage(chatId, '❌ Telefon ulanmagan. `/link` buyrug\'idan foydalaning.', { parse_mode: 'Markdown' });
    }
    const user = users.find(u => u.phone === phone);
    if (user) {
      delete user.telegramChatId;
      if (saveUsersFn) saveUsersFn();
    }
    chatToPhone.delete(String(chatId));
    bot.sendMessage(chatId, '✅ Telefon uzildi.');
  });

  // ── /queue ─────────────────────────────────────────────
  bot.onText(/\/queue/, (msg) => {
    const chatId = msg.chat.id;
    const phone = chatToPhone.get(String(chatId));
    if (!phone) return bot.sendMessage(chatId, '❌ Telefon ulanmagan. `/link` buyrug\'idan foydalaning.', { parse_mode: 'Markdown' });

    const found = findUserByPhoneFn ? findUserByPhoneFn(phone) : null;
    if (!found) {
      return bot.sendMessage(chatId, '✅ Siz hozir hech qanday navbatda emassiz.');
    }

    // Station name lookup from STATIONS_AUTH or use stationId
    const stationName = found.stationId || 'Asosiy navbat';
    
    let queueMsg = `🚗 *Siz navbatdasiz!*\n\n` +
      `№${found.idx + 1} o'rin\n` +
      `Sizdan oldin: ${found.idx} ta\n` +
      `Stansiya: ${stationName}\n` +
      `Qo'shilgan: ${new Date(found.user.joinedAt).toLocaleString('uz-UZ')}`;

    if (found.user.arrivalTime) {
      queueMsg += `\n📋 Kelish vaqti: ${found.user.arrivalTime}`;
    }

    bot.sendMessage(chatId, queueMsg, { parse_mode: 'Markdown' });
  });

  // ── /history ───────────────────────────────────────────
  bot.onText(/\/history/, (msg) => {
    const chatId = msg.chat.id;
    const phone = chatToPhone.get(String(chatId));
    if (!phone) return bot.sendMessage(chatId, '❌ Telefon ulanmagan. `/link` buyrug\'idan foydalaning.', { parse_mode: 'Markdown' });

    const user = users.find(u => u.phone === phone);
    if (!user) return bot.sendMessage(chatId, '📋 Hali zapravka tarixi yo\'q.');

    const myHistory = refuelHistory
      .filter(r => r.phone === phone)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    if (myHistory.length === 0) {
      return bot.sendMessage(chatId, '📋 Hali zapravka tarixi yo\'q.');
    }

    let text = `📋 *So'nggi ${myHistory.length} ta zapravka:*\n\n`;
    myHistory.forEach((r, i) => {
      const d = new Date(r.time);
      text += `${i + 1}. 📞 ${r.phone || '—'}\n`;
      text += `   🕐 ${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}\n`;
      if (r.gasAmount) text += `   ⛽ ${r.gasAmount}\n`;
      if (r.stationName) text += `   🏪 ${r.stationName}\n`;
      text += '\n';
    });

    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  });

  // ── /notifications ─────────────────────────────────────
  bot.onText(/\/notifications/, (msg) => {
    const chatId = msg.chat.id;
    const phone = chatToPhone.get(String(chatId));
    if (!phone) return bot.sendMessage(chatId, '❌ Telefon ulanmagan. `/link` buyrug\'idan foydalaning.', { parse_mode: 'Markdown' });

    const user = users.find(u => u.phone === phone);
    const uid = user?.id;
    if (!uid) return bot.sendMessage(chatId, '🔔 Bildirishnomalar yo\'q.');

    const notifs = notificationsMap ? (notificationsMap.get(uid) || []) : [];
    if (notifs.length === 0) {
      return bot.sendMessage(chatId, '🔔 Bildirishnomalar yo\'q.');
    }

    const recent = notifs.slice(0, 10);
    let text = `🔔 *So'nggi ${recent.length} ta bildirishnoma:*\n\n`;
    recent.forEach((n, i) => {
      const d = new Date(n.time);
      text += `${i + 1}. ${n.title}\n`;
      text += `   ${n.body}\n`;
      text += `   🕐 ${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    });

    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  });

  return bot;
}

// ── Send Telegram notification to a user ────────────────
export async function sendTelegramNotification(userId, title, body) {
  if (!bot) return;
  const user = users.find(u => u.id === userId);
  if (!user || !user.telegramChatId) return;
  
  const chatId = user.telegramChatId;
  
  try {
    // Check if this is an arrival confirmation message
    if (body.includes('Подъехали?')) {
      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Да, подъехал', callback_data: 'arrived_yes' },
            { text: '❌ Нет', callback_data: 'arrived_no' }
          ]
        ]
      };
      
      await bot.sendMessage(chatId,
        `🔔 *${escapeMd(title)}*\n\n${escapeMd(body)}`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    } else {
      await bot.sendMessage(chatId,
        `🔔 *${escapeMd(title)}*\n\n${escapeMd(body)}`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
}

function escapeMd(text) {
  // Markdown v1: only _, *, ` need escaping
  return text.replace(/[_*`]/g, '\\$&');
}
