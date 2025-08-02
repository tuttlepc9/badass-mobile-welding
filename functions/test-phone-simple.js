// functions/test-phone-simple.js
// Simple test function you can access directly in browser

export default async (request, context) => {
  // Check if we have the Anthropic API key
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  
  // Simple test call data
  const testCallData = {
    call_id: 'test_' + Date.now(),
    from_number: '(865) 555-0123',
    to_number: '(865) XXX-XXXX',
    call_length: 180,
    transcript: "Hi, I'm calling about welding services. My name is John Smith and I need some structural welding work done on my barn in Lenoir City. The project involves welding some steel beams that got damaged in a storm. I'm hoping to get this done within the next week if possible. My budget is around $2,000 to $3,000. Can someone call me back at this number?",
    status: 'completed',
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString()
  };

  const response = {
    status: 'Phone System Test',
    timestamp: new Date().toISOString(),
    environment_check: {
      anthropic_api_key: hasApiKey ? '✅ Found' : '❌ Missing',
      internal_api_key: process.env.INTERNAL_API_KEY ? '✅ Found' : '❌ Missing'
    },
    test_call_data: testCallData,
    webhook_url: `${new URL(request.url).origin}/.netlify/functions/phone-webhook`,
    next_steps: [
      '1. Make sure both API keys are set in Netlify environment variables',
      '2. Test the webhook function',
      '3. Set up Bland.ai with the webhook URL',
      '4. Test with a real phone call'
    ]
  };

  // If we have the API key, try to test the webhook
  if (hasApiKey) {
    try {
      const webhookUrl = `${new URL(request.url).origin}/.netlify/functions/phone-webhook`;
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCallData)
      });

      const webhookResult = await webhookResponse.json();
      response.webhook_test = {
        status: webhookResponse.ok ? '✅ Success' : '❌ Failed',
        response: webhookResult
      };
    } catch (error) {
      response.webhook_test = {
        status: '❌ Error',
        error: error.message
      };
    }
  }

  return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>Phone System Test - Badass Mobile Welding</title>
    <style>
        body { font-family: monospace; background: #0a0a0a; color: #00ff00; padding: 20px; }
        .success { color: #00ff00; }
        .error { color: #ff4444; }
        .warning { color: #ffaa00; }
        pre { background: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; }
        h1 { color: #ff6b35; }
        .status { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔥 Badass Mobile Welding - Phone System Test</h1>
    
    <div class="status">
        <strong>Environment Check:</strong><br>
        Anthropic API Key: <span class="${hasApiKey ? 'success' : 'error'}">${hasApiKey ? '✅ Found' : '❌ Missing'}</span><br>
        Internal API Key: <span class="${process.env.INTERNAL_API_KEY ? 'success' : 'error'}">${process.env.INTERNAL_API_KEY ? '✅ Found' : '❌ Missing'}</span>
    </div>

    <div class="status">
        <strong>Webhook URL:</strong><br>
        <code>${new URL(request.url).origin}/.netlify/functions/phone-webhook</code>
    </div>

    <div class="status">
        <strong>Test Results:</strong>
        <pre>${JSON.stringify(response, null, 2)}</pre>
    </div>

    <div class="status">
        <h3>Next Steps:</h3>
        <ol>
            <li>Make sure environment variables are set in Netlify</li>
            <li>Copy the webhook URL above for Bland.ai setup</li>
            <li>Test with real phone calls</li>
        </ol>
    </div>

    <div class="status">
        <strong>Access Admin Dashboard:</strong><br>
        <a href="/admin.html" style="color: #ff6b35;">Admin Dashboard</a>
    </div>
</body>
</html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
};
