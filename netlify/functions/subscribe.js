exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, message: 'Method not allowed' })
      };
    }
  
    try {
      // Parse the incoming request body
      const data = JSON.parse(event.body);
      
      // Basic validation
      if (!data.email) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Email is required' })
        };
      }
      
      // Prepare the request to MailerLite API
      const payload = {
        email: data.email,
        fields: data.fields || {},
        groups: data.groups || []
      };
      
      // Your MailerLite API key (store this in environment variables)
      const API_KEY = process.env.MAILERLITE_API_KEY;
      
      if (!API_KEY) {
        console.error('MailerLite API key not found');
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, message: 'Server configuration error' })
        };
      }
      
      // Make the request to MailerLite API using native fetch (Node.js 18+)
      try {
        const response = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MailerLite-ApiKey': API_KEY
          },
          body: JSON.stringify(payload)
        });
        
        const responseData = await response.json();
        
        // Check if the request was successful
        if (response.ok) {
          return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
          };
        } else {
          console.error('MailerLite API error:', responseData);
          return {
            statusCode: 400,
            body: JSON.stringify({ 
              success: false, 
              message: responseData.error?.message || 'Failed to subscribe' 
            })
          };
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, message: 'Connection error' })
        };
      }
      
    } catch (error) {
      console.error('Server error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'Server error' })
      };
    }
  };