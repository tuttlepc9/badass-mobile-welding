export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const callData = await request.json();
    console.log('📞 Received call data:', callData);

    // Create lead record
    const leadRecord = {
      id: `call_${Date.now()}`,
      source: 'phone_call',
      phone_number: callData.from_number || 'Unknown',
      call_date: callData.started_at || new Date().toISOString(),
      call_duration: callData.call_length || 0,
      transcript: callData.transcript || 'No transcript available',
      status: 'new',
      processed_at: new Date().toISOString()
    };

    console.log('📋 Lead record created:', leadRecord);

    return new Response(JSON.stringify({
      success: true,
      message: 'Call processed successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error processing call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
