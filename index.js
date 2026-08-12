
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on("qr", (qr) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Mankylerbot is online!");
});

client.on("message", async (msg) => {
  try {
    const chat = await msg.getChat();

    if (!chat.isGroup) return;

    // Welcome message
    if (msg.body.toLowerCase() === "hi") {
      await msg.reply("👋 Welcome to the group! I'm Mankylerbot.");
      return;
    }

    // Help command
    if (msg.body.toLowerCase() === "!help") {
      await msg.reply(
        "🤖 Mankylerbot commands:\n\n" +
        "!help - Show commands\n" +
        "!groupinfo - Group information\n" +
        "!approveall - Approve pending members\n" +
        "!remove - Remove a replied-to member\n" +
        "!warn - Warn a replied-to member"
      );
      return;
    }

    // Group information
    if (msg.body.toLowerCase() === "!groupinfo") {
      await msg.reply(
        `📋 Group: ${chat.name}\n👥 Members: ${chat.participants.length}`
      );
      return;
    }

    // Approve all pending membership requests
    if (msg.body.toLowerCase() === "!approveall") {
      const result = await chat.approveGroupMembershipRequests({});
      await msg.reply(
        result.length
          ? `✅ Approved ${result.length} pending member request(s).`
          : "ℹ️ There are no pending member requests."
      );
      return;
    }

    // Remove a member by replying to their message
    if (msg.body.toLowerCase() === "!remove") {
      if (!msg.hasQuotedMsg) {
        await msg.reply("↩️ Reply to the member's message with !remove.");
        return;
      }

      const quoted = await msg.getQuotedMessage();
      const contact = await quoted.getContact();

      await chat.removeParticipants([contact.id._serialized]);
      await msg.reply("✅ Member removed.");
      return;
    }

    // Warn a member by replying to their message
    if (msg.body.toLowerCase() === "!warn") {
      if (!msg.hasQuotedMsg) {
        await msg.reply("⚠️ Reply to the member's message with !warn.");
        return;
      }

      const quoted = await msg.getQuotedMessage();
      const contact = await quoted.getContact();

      await msg.reply(
        `⚠️ Warning issued to @${contact.number}`,
        undefined,
        { mentions: [contact] }
      );
    }
  } catch (error) {
    console.error("Bot error:", error);
  }
});

client.initialize();
