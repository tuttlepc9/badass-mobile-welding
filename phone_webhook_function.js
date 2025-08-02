// netlify/functions/phone-webhook.js
// This function receives call data from Bland.ai and processes it with Claude

export default async (request, context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get call data from Bland.ai webhook
    const callData = await request.json();
    
    console.log('Received call data:', callData);
    
    // Extract key information from Bland.ai
    const {
      call_id,
      from_number,
      to_number,
      call_length,
      transcript,
      status,
      started_at,
      ended_at
    } = callData;

    // Use Claude to analyze the call transcript
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Analyze this welding service call transcript and extract the following information in JSON format:

Transcript: "${transcript}"

Please extract:
{
  "customer_name": "name if mentioned or 'Unknown'",
  "project_type": "structural|repairs|custom|unknown",
  "project_description": "brief description",
  "location": "city/zip if mentioned or 'Unknown'",
  "budget_range": "estimated range or 'not mentioned'",
  "urgency": "emergency|this_week|this_month|no_rush|unknown",
  "lead_quality": "hot|warm|cold",
  "contact_info": "any email or preferred contact method mentioned",
  "special_notes": "any important details"
}

Only return valid JSON, no other text.`
        }]
      })
    });

    let analysis = {
      customer_name: "Unknown",
      project_type: "unknown",
      project_description: transcript?.substring(0, 100) || "No transcript available",
      location: "Unknown",
      budget_range: "not mentioned",
      urgency: "unknown",
      lead_quality: "warm",
      contact_info: from_number || "Unknown",
      special_notes: "Phone call analysis"
    };

    if (claudeResponse.ok) {
      const claudeData = await claudeResponse.json();
      try {
        const analysisText = claudeData.content[0].text;
        analysis = JSON.parse(analysisText);
      } catch (e) {
        console.log('Failed to parse Claude response, using defaults');
      }
    }

    // Create comprehensive lead record
    const leadRecord = {
      // Lead ID and source
      id: `call_${call_id}`,
      source: 'phone_call',
      
      // Call metadata
      call_id,
      phone_number: from_number,
      call_date: started_at || new Date().toISOString(),
      call_duration: call_length || 0,
      call_status: status || 'completed',
      
      // Claude analysis
      ...analysis,
      
      // Raw data
      full_transcript: transcript || 'No transcript available',
      processed_at: new Date().toISOString(),
      status: 'new'
    };

    // Store the lead data (using a simple approach for now)
    // In production, you'd use Netlify Blobs or a database
    console.log('📞 NEW PHONE LEAD:', leadRecord);

    // Send notification for hot leads
    if (analysis.lead_quality === 'hot' || analysis.urgency === 'emergency') {
      console.log(`🔥 HOT LEAD ALERT: ${analysis.customer_name} - ${analysis.project_type}`);
      
      // You could send email/SMS notification here
      // Example: await sendEmailNotification(leadRecord);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Call processed successfully',
      lead_quality: analysis.lead_quality,
      call_id,
      customer_name: analysis.customer_name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing call:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};