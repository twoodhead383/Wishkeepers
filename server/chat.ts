interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

// Wishkeepers FAQ knowledge base
const FAQ_RESPONSES = {
  // Security-related questions
  security: {
    keywords: ['secure', 'security', 'safe', 'encryption', 'protect', 'hack', 'data breach', 'privacy'],
    response: `Your data security is our top priority. Here's how we protect your information:

🔒 **Bank-Level Encryption**: We use AES-256 encryption, the same standard used by financial institutions
🛡️ **Zero-Knowledge Access**: Only you and your approved trusted contacts can access your vault
✅ **Admin Verification**: All data release requests are manually reviewed by our security team
🔐 **Secure Storage**: Your data is encrypted both in transit and at rest

Your sensitive information is never stored in plain text, and we never sell or share your data with third parties.`
  },

  // Account and password issues
  account: {
    keywords: ['password', 'forgot password', 'login', 'account', 'sign in', 'access', 'username'],
    response: `For account-related issues:

🔑 **Forgot Password**: Use the "Forgot Password" link on the login page to reset your password securely
👤 **Account Access**: Make sure you're using the email address you registered with
🔄 **Password Reset**: Check your email (including spam folder) for the reset link
📧 **Email Issues**: If you're not receiving emails, contact support@wishkeepers.com

If you're still having trouble, our support team can help verify your account: support@wishkeepers.com`
  },

  // Vault and features
  vault: {
    keywords: ['vault', 'store', 'information', 'funeral wishes', 'insurance', 'banking', 'add', 'update', 'complete'],
    response: `Your Wishkeepers vault can store:

💝 **Funeral Wishes & Personal Messages**: Service preferences, personal items to gift, heartfelt messages
💰 **Insurance & Financial Info**: Policy numbers, account details, important financial documents  
🔐 **Digital Assets**: Account passwords and digital asset information (securely encrypted)
📄 **Important Documents**: Location of wills, deeds, certificates, and other critical papers

💡 **Pro Tip**: Use the "Funeral Wishes" section to specify personal items for specific people - this keeps gifts outside your formal will and can reduce probate complexity!

You can update your vault anytime by logging into your account.`
  },

  // Trusted contacts
  contacts: {
    keywords: ['trusted contacts', 'family', 'friends', 'access', 'invite', 'nominate', 'wishkeeper'],
    response: `Trusted contacts are family members or friends who can request access to your vault when needed.

👥 **How to Add**: Go to "Trusted Contacts" in your dashboard and send email invitations
📨 **Email Invitations**: Your contacts receive secure invitation links to accept their role
🔒 **Access Process**: They must submit a data release request with proper documentation
✅ **Admin Approval**: Our team verifies each request before granting access
📞 **Emergency**: For urgent situations, call our emergency line: 1-800-WISHKEEP ext. 911

Trusted contacts don't need to create full accounts - they can act solely as wishkeepers when needed.`
  },

  // Data release process
  release: {
    keywords: ['data release', 'death', 'access vault', 'family access', 'release request', 'emergency'],
    response: `Here's how your family accesses your vault when needed:

1️⃣ **Request Submission**: Trusted contact submits a data release request with required documentation
2️⃣ **Admin Verification**: Our security team manually reviews and verifies the request
3️⃣ **Access Granted**: Upon approval, your information becomes available to designated contacts

📋 **Required Documentation**: Death certificate or other official documentation
⏱️ **Processing Time**: Typically 2-3 business days for verification
🚨 **Emergency Support**: 24/7 emergency line available: 1-800-WISHKEEP ext. 911

This process ensures your data is only released appropriately while providing your family the access they need.`
  },

  // Pricing and plans
  pricing: {
    keywords: ['cost', 'price', 'pricing', 'free', 'premium', 'plan', 'subscription', 'payment'],
    response: `Wishkeepers offers flexible pricing options:

🆓 **Free Plan**: Complete basic vault functionality - free forever
⭐ **Premium Features**: Advanced features available for enhanced needs
💳 **No Hidden Fees**: Transparent pricing with no surprise charges
🔄 **Cancel Anytime**: Full control over your subscription

The basic vault includes all essential features: secure storage, trusted contacts, and the data release process. Contact our team for specific pricing details: support@wishkeepers.com`
  },

  // General support
  support: {
    keywords: ['help', 'support', 'contact', 'phone', 'email', 'assistance'],
    response: `We're here to help! Contact options:

📧 **Email Support**: support@wishkeepers.com - Detailed help with account questions
📞 **Phone Support**: 1-800-WISHKEEP (Mon-Fri 9AM-6PM EST)  
💬 **Live Chat**: Right here! I can answer most questions immediately
🚨 **Emergency**: 24/7 emergency support: 1-800-WISHKEEP ext. 911

Average response times:
- Live chat: Immediate
- Email: Within 2-4 hours  
- Phone: Available during business hours`
  }
};

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check each category for keyword matches
  for (const [category, data] of Object.entries(FAQ_RESPONSES)) {
    const matchCount = data.keywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount > 0) {
      return data.response;
    }
  }
  
  // Default response for unmatched queries
  return `I'd be happy to help! I can provide information about:

🔒 **Security & Privacy** - How we protect your data
👤 **Account Management** - Login, passwords, account issues  
🗄️ **Vault Features** - What you can store and how to use it
👥 **Trusted Contacts** - Adding family/friends who can access your vault
📋 **Data Release Process** - How your family accesses information when needed
💰 **Pricing & Plans** - Cost and subscription details

Just ask me about any of these topics! For complex issues, you can also reach our human support team:
- Email: support@wishkeepers.com
- Phone: 1-800-WISHKEEP
- Emergency: 1-800-WISHKEEP ext. 911`;
}

export async function handleChatMessage(req: ChatRequest): Promise<string> {
  const { message, conversationHistory } = req;
  
  // For now, use the local FAQ system
  // In the future, this could integrate with Perplexity API when available
  return findBestResponse(message);
}

// If Perplexity API key is available, use AI-powered responses
export async function handleChatWithAI(req: ChatRequest): Promise<string> {
  const { message, conversationHistory } = req;
  
  if (!process.env.PERPLEXITY_API_KEY) {
    // Fall back to FAQ system if no API key
    return findBestResponse(message);
  }

  try {
    // Create context from conversation history
    const context = conversationHistory
      .slice(-3) // Last 3 messages for context
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a helpful customer support assistant for Wishkeepers, a secure digital legacy vault application. 

About Wishkeepers:
- Secure storage for funeral wishes, insurance info, banking details, personal messages
- AES-256 encryption, zero-knowledge access
- Users nominate trusted contacts who can request data access
- Admin-verified data release process for security
- Free basic plan, premium features available

Guidelines:
- Be warm, empathetic, and professional (legacy planning is sensitive)
- Provide specific, actionable help
- Always prioritize security and privacy in your responses  
- If you don't know something specific, direct them to support@wishkeepers.com
- Keep responses concise but complete

Previous conversation context:
${context}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || findBestResponse(message);
    
  } catch (error) {
    console.error('Chat AI error:', error);
    // Fall back to FAQ system on error
    return findBestResponse(message);
  }
}