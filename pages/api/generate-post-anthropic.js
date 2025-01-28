import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ 
      message: 'Anthropic API key not configured'
    });
  }

  try {
    // Create message using the latest API version
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write an engaging blog post about web3 and public goods. The post should be formatted exactly as follows:

# [An engaging title here]

[The main content here...]

Requirements:
- Make it informative and inspiring
- Focus on building and contributing to web3 public goods
- Include practical examples and actionable insights
- Keep the tone professional but engaging
- Keep paragraphs concise and well-structured
- Include a clear call to action at the end`
      }],
      temperature: 0.7
    });

    // Validate response
    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Anthropic API');
    }

    // Return the generated content
    return res.status(200).json({
      content: message.content[0].text
    });

  } catch (error) {
    console.error('Error generating post:', error);
    
    // Return appropriate error response
    return res.status(500).json({
      message: 'Failed to generate post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}