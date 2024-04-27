const axios = require('axios');

module.exports = {
  config: {
    name: "ai",
    version: "1.0.0",
    hasPermission: true,
    description: "Herc.ai LLM Model",
    usePrefix: false,
    credits: "Rui",
    cooldowns: 5
  }, 
  async run({
    api, event, args
  }) {
    const query = args.join(" ");
    
    if (!query) {
      api.sendMessage('❌ | No query detected! Usage: herc <query>', event.threadID, event.messageID);
      return;
    }
    
    try {
      const userData = await api.getUserInfo(event.senderID);
      const userName = userData[event.senderID].name;
      
      api.setMessageReaction("⏳", event.messageID);

      const response = await axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(query)}`);
      
      if (response.data) {
        const reply = response.data.reply;
        api.sendMessage(`🔥 | Herc.ai\n━━━━━━━━━━━━━━━\n${reply}\n\n🗣️ | Question asked by ${userName}`, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID);
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | An error occurred while processing your request.", event.threadID, event.messageID);
    }
  }
};
