export default async (request, context) => {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>Phone System Test - Badass Mobile Welding</title>
    <style>
        body { font-family: monospace; background: #0a0a0a; color: #00ff00; padding: 20px; }
        .success { color: #00ff00; }
        h1 { color: #ff6b35; }
    </style>
</head>
<body>
    <h1>🔥 Badass Mobile Welding - Phone System Test</h1>
    <div class="success">✅ Functions are working!</div>
    <p><strong>Webhook URL for Bland.ai:</strong><br>
    ${new URL(request.url).origin}/.netlify/functions/phone-webhook</p>
    <p><strong>Test URL:</strong><br>
    ${new URL(request.url).origin}/.netlify/functions/test-phone-simple</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
</body>
</html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
};
