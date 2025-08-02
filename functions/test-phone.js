// netlify/functions/test-phone.js
// Test function to simulate phone calls

export default async (request, context) => {
  // Simple auth check
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== process.env.INTERNAL_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Test call data
  const testCallData = {
    call_id: 'test_' + Date.now(),
    from_number: '(865) 555-0123',
    to_number: '(865) XXX-XXXX',
    call_length: 180, // 3 minutes
    transcript: "Hi, I'm calling about welding services. My name is John Smith and I need some structural welding work done on my barn in Lenoir City. The project involves welding some steel beams that got damaged in a storm. I'm hoping to get this done within the next week if possible. My budget is around $2,000 to $3,000. Can someone call me back at this number?",
    status: 'completed',
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString()
  };

  try {
    // Call our webhook function
    const webhookUrl = `${new URL(request.url).origin}/.netlify/functions/phone-webhook`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCallData)
    });

    const result = await response.json();

    return new Response(JSON.stringify({
      test_call: testCallData,
      webhook_response: result,
      status: 'Test completed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      test_call: testCallData
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
