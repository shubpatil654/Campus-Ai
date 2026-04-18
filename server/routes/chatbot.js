const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI initialized successfully');
} else {
  console.log('⚠️ OpenAI API key not configured - using fallback responses');
}

// @desc    Chat with AI about colleges
// @route   POST /api/chatbot/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let response, intent, collegeData = [];

    if (openai) {
      // Use OpenAI if available
      intent = await classifyIntent(message);
      collegeData = await fetchCollegeData(intent);
      response = await generateResponse(message, intent, collegeData);
    } else {
      // Fallback to basic responses without OpenAI
      const basicResponse = await generateBasicResponse(message);
      response = basicResponse.response;
      intent = basicResponse.intent;
      collegeData = basicResponse.collegeData;
    }

    // Save the conversation to database
    await saveConversation(userId, message, response, intent);

    res.json({
      success: true,
      data: {
        response,
        intent: intent.type || 'basic',
        dataUsed: collegeData.length > 0
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again.'
    });
  }
});

// Classify user intent using OpenAI
async function classifyIntent(message) {
  try {
    const prompt = `
    Analyze this user message about colleges and classify it into one of these intents:
    
    1. "college_list" - User wants a list of colleges (e.g., "show me colleges", "list all colleges", "what colleges are available")
    2. "college_search" - User wants to search colleges by criteria (e.g., "colleges with science stream", "engineering colleges in Bangalore", "colleges under 1 lakh fees")
    3. "college_details" - User wants details about a specific college (e.g., "tell me about RLS Institute", "what courses does GSS offer")
    4. "course_info" - User wants information about courses (e.g., "what is computer science engineering", "courses available", "engineering streams")
    5. "admission_help" - User needs help with admission process, requirements, or procedures
    6. "career_guidance" - User wants career advice or guidance
    7. "general" - General questions not related to specific colleges or courses
    
    User message: "${message}"
    
    Extract relevant information and respond with a JSON object containing:
    {
      "type": "intent_type",
      "criteria": {
        "stream": "stream_name_if_mentioned",
        "location": "location_if_mentioned", 
        "fees": "fees_range_if_mentioned",
        "college_name": "college_name_if_mentioned",
        "course_name": "course_name_if_mentioned",
        "grade": "grade_or_qualification_if_mentioned",
        "interests": "career_interests_if_mentioned"
      },
      "confidence": 0.95
    }
    
    Be thorough in extracting criteria. For example:
    - "engineering colleges in Bangalore under 2 lakhs" should extract location: "Bangalore", stream: "Engineering", fees: "under 2 lakhs"
    - "I want to study computer science after 12th" should extract stream: "Computer Science", grade: "12th"
    - "Tell me about Jain College" should extract college_name: "Jain College"
    - "what's the fees for PCMC course in jain college" should extract college_name: "Jain College", course_name: "PCMC", type: "fees_info"
    - "PCMC course fees in Jain College" should extract college_name: "Jain College", course_name: "PCMC", type: "fees_info"
    - "how much does B.Tech cost in IIT" should extract college_name: "IIT", course_name: "B.Tech", type: "fees_info"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Intent classification error:', error);
    return { type: 'general', criteria: {}, confidence: 0.5 };
  }
}

// Fetch college data based on intent
async function fetchCollegeData(intent) {
  try {
    let query = supabase
      .from('colleges')
      .select(`
        id,
        name,
        description,
        location,
        address,
        website,
        phone,
        email,
        established_year,
        rating,
        total_ratings,
        logo_url,
        courses (
          id,
          name,
          stream,
          duration,
          fees,
          seats_available,
          eligibility_criteria
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Apply filters based on intent criteria
    if (intent.criteria.location) {
      query = query.ilike('location', `%${intent.criteria.location}%`);
    }

    if (intent.criteria.college_name) {
      query = query.ilike('name', `%${intent.criteria.college_name}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    let filteredData = data || [];

    // Filter by stream and fees after fetching (since we can't filter nested relations easily)
    if (intent.criteria.stream) {
      filteredData = filteredData.filter(college => 
        college.courses && college.courses.some(course => 
          course.stream && course.stream.toLowerCase().includes(intent.criteria.stream.toLowerCase())
        )
      );
    }

    if (intent.criteria.fees) {
      const feesRange = parseFeesRange(intent.criteria.fees);
      if (feesRange.max) {
        filteredData = filteredData.filter(college => 
          college.courses && college.courses.some(course => 
            course.fees && course.fees <= feesRange.max
          )
        );
      }
    }

    // If looking for specific course, filter courses within colleges
    if (intent.criteria.course_name) {
      filteredData = filteredData.map(college => ({
        ...college,
        courses: college.courses ? college.courses.filter(course => 
          course.name && course.name.toLowerCase().includes(intent.criteria.course_name.toLowerCase())
        ) : []
      })).filter(college => college.courses.length > 0);
    }

    return filteredData;
  } catch (error) {
    console.error('Fetch college data error:', error);
    return [];
  }
}

// Parse fees range from text
function parseFeesRange(feesText) {
  const range = { min: null, max: null };
  
  // Extract numbers from text
  const numbers = feesText.match(/\d+/g);
  if (numbers) {
    const num = parseInt(numbers[0]);
    if (feesText.includes('lakh') || feesText.includes('L')) {
      range.max = num * 100000; // Convert lakh to rupees
    } else if (feesText.includes('thousand') || feesText.includes('k')) {
      range.max = num * 1000; // Convert thousand to rupees
    } else {
      range.max = num;
    }
  }
  
  return range;
}

// Generate response using OpenAI with fetched data
async function generateResponse(userMessage, intent, collegeData) {
  try {
    let contextData = '';
    
    if (collegeData.length > 0) {
      contextData = `
      Here is the relevant college data from our database:
      
      ${collegeData.map(college => `
      College: ${college.name}
      Location: ${college.location}
      Rating: ${college.rating}/5 (${college.total_ratings} reviews)
      Established: ${college.established_year}
      Description: ${college.description}
      Website: ${college.website}
      Phone: ${college.phone}
      Email: ${college.email}
      
      Courses Offered:
      ${college.courses.map(course => `
        - ${course.name} (${course.stream})
        Duration: ${course.duration}
        Fees: ₹${course.fees?.toLocaleString()}
        Seats Available: ${course.seats_available}
        Eligibility: ${course.eligibility_criteria}
      `).join('')}
      `).join('\n---\n')}
      `;
    }

    const systemPrompt = `You are CampusAI. Give SHORT 1-2 line answers only. If data is provided, use it directly. If no data, say "No data found".`;

    const userPrompt = `Student Question: "${userMessage}"

${contextData}

Provide a SHORT 1-2 line response. If college data is provided above, give the exact information requested. For fee queries, state the exact amount.

Guidelines:
- Keep responses under 2 lines
- Be direct and specific
- Use emojis sparingly
- If data exists, provide it directly
- If no data, say "No data found for [specific query]"

Respond briefly:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Response generation error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team.";
  }
}

// Generate basic response without OpenAI
async function generateBasicResponse(message) {
  const lowerMessage = message.toLowerCase();
  let response = '';
  let intent = { type: 'basic' };
  let collegeData = [];

  // Check for common college-related keywords
  if (lowerMessage.includes('college') || lowerMessage.includes('colleges')) {
    if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('all')) {
      // Fetch all colleges
      collegeData = await fetchAllColleges();
      response = `Here are the colleges available in our database:\n\n${collegeData.map(college => 
        `🏫 **${college.name}**\n📍 Location: ${college.location}\n⭐ Rating: ${college.rating}/5\n🌐 Website: ${college.website}\n\n`
      ).join('')}`;
      intent.type = 'college_list';
    } else if (lowerMessage.includes('computer science') || lowerMessage.includes('cs')) {
      collegeData = await fetchCollegesByStream('Computer Science');
      response = `Here are colleges offering Computer Science courses:\n\n${collegeData.map(college => 
        `🏫 **${college.name}**\n📍 Location: ${college.location}\n⭐ Rating: ${college.rating}/5\n💰 Fees: ₹${college.courses?.[0]?.fees?.toLocaleString() || 'N/A'}\n\n`
      ).join('')}`;
      intent.type = 'college_search';
    } else if (lowerMessage.includes('engineering')) {
      collegeData = await fetchAllColleges();
      response = `Here are the engineering colleges available:\n\n${collegeData.map(college => 
        `🏫 **${college.name}**\n📍 Location: ${college.location}\n⭐ Rating: ${college.rating}/5\n📚 Courses: ${college.courses?.map(c => c.name).join(', ') || 'N/A'}\n\n`
      ).join('')}`;
      intent.type = 'college_search';
    } else {
      response = "I can help you find information about colleges! Try asking:\n• 'Show me all colleges'\n• 'Computer Science colleges'\n• 'Engineering colleges'\n• 'Tell me about [college name]'";
    }
  } else if (lowerMessage.includes('course') || lowerMessage.includes('courses')) {
    if (lowerMessage.includes('jain')) {
      collegeData = await fetchCollegeByName('Jain');
      if (collegeData.length > 0 && collegeData[0].courses) {
        response = `Jain College courses: ${collegeData[0].courses.map(c => c.name).join(', ')}`;
      } else {
        response = 'No courses found for Jain College';
      }
    } else {
      collegeData = await fetchAllCourses();
      response = `Available courses: ${collegeData.slice(0, 5).map(course => course.name).join(', ')}`;
    }
    intent.type = 'course_info';
  } else if (lowerMessage.includes('rls') || lowerMessage.includes('gss') || lowerMessage.includes('jain')) {
    // Search for specific college
    const collegeName = lowerMessage.includes('rls') ? 'RLS' : lowerMessage.includes('gss') ? 'GSS' : 'Jain';
    collegeData = await fetchCollegeByName(collegeName);
    if (collegeData.length > 0) {
      const college = collegeData[0];
      response = `🏫 **${college.name}**\n\n📍 Location: ${college.location}\n⭐ Rating: ${college.rating}/5 (${college.total_ratings} reviews)\n🏛️ Established: ${college.established_year}\n📝 Description: ${college.description}\n🌐 Website: ${college.website}\n📞 Phone: ${college.phone}\n📧 Email: ${college.email}\n\n📚 **Courses Offered:**\n${college.courses?.map(course => 
        `• ${course.name} (${course.stream})\n  Duration: ${course.duration}\n  Fees: ₹${course.fees?.toLocaleString()}\n  Seats: ${course.seats_available}\n`
      ).join('\n') || 'No courses available'}`;
      intent.type = 'college_details';
    } else {
      response = `I couldn't find information about ${collegeName} Institute. Please check the spelling or try asking about other colleges.`;
    }
  } else {
    response = `Hello! I'm your college assistant. I can help you with:\n\n🎓 **College Information**\n• List all colleges\n• Find colleges by stream\n• Get college details\n\n📚 **Course Information**\n• Available courses\n• Course details and fees\n• Eligibility criteria\n\nTry asking me something like:\n• "Show me all colleges"\n• "Computer Science colleges"\n• "Tell me about RLS Institute"\n• "What courses are available?"`;
  }

  return { response, intent, collegeData };
}

// Fetch all colleges
async function fetchAllColleges() {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        id,
        name,
        description,
        location,
        website,
        phone,
        email,
        established_year,
        rating,
        total_ratings,
        courses (
          id,
          name,
          stream,
          duration,
          fees,
          seats_available
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('rating', { ascending: false });

    return data || [];
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
}

// Fetch colleges by stream
async function fetchCollegesByStream(stream) {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        id,
        name,
        description,
        location,
        website,
        phone,
        email,
        established_year,
        rating,
        total_ratings,
        courses (
          id,
          name,
          stream,
          duration,
          fees,
          seats_available
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .contains('courses', [{ stream: stream }])
      .order('rating', { ascending: false });

    return data || [];
  } catch (error) {
    console.error('Error fetching colleges by stream:', error);
    return [];
  }
}

// Fetch all courses
async function fetchAllCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        name,
        stream,
        duration,
        fees,
        seats_available,
        eligibility_criteria,
        colleges (
          name
        )
      `)
      .eq('is_active', true)
      .order('name');

    return data?.map(course => ({
      ...course,
      college_name: course.colleges?.name || 'Unknown'
    })) || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Fetch college by name
async function fetchCollegeByName(collegeName) {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        id,
        name,
        description,
        location,
        website,
        phone,
        email,
        established_year,
        rating,
        total_ratings,
        courses (
          id,
          name,
          stream,
          duration,
          fees,
          seats_available,
          eligibility_criteria
        )
      `)
      .ilike('name', `%${collegeName}%`)
      .eq('is_active', true)
      .eq('is_verified', true);

    return data || [];
  } catch (error) {
    console.error('Error fetching college by name:', error);
    return [];
  }
}

// Save conversation to database
async function saveConversation(userId, userMessage, aiResponse, intent) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: userMessage,
        response: aiResponse,
        is_ai_response: true,
        metadata: {
          intent: intent.type,
          criteria: intent.criteria || {},
          confidence: intent.confidence || 0.8
        }
      });

    if (error) {
      console.error('Error saving conversation:', error);
    }
  } catch (error) {
    console.error('Save conversation error:', error);
  }
}

// @desc    Get chat history for user
// @route   GET /api/chatbot/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history'
      });
    }

    res.json({
      success: true,
      data: messages || []
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

// @desc    Test OpenAI connection
// @route   GET /api/chatbot/test
// @access  Private
router.get('/test', protect, async (req, res) => {
  try {
    if (!openai) {
      return res.json({
        success: false,
        message: 'OpenAI not configured. Please add OPENAI_API_KEY to environment variables.',
        openaiAvailable: false
      });
    }

    // Test OpenAI connection with a simple request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 50,
    });

    res.json({
      success: true,
      message: 'OpenAI is working correctly!',
      openaiAvailable: true,
      testResponse: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({
      success: false,
      message: 'OpenAI test failed: ' + error.message,
      openaiAvailable: false
    });
  }
});

// Fetch college by name
async function fetchCollegeByName(collegeName) {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        id,
        name,
        description,
        location,
        address,
        website,
        phone,
        email,
        established_year,
        rating,
        total_ratings,
        logo_url,
        courses (
          id,
          name,
          stream,
          duration,
          fees,
          seats_available,
          eligibility_criteria
        )
      `)
      .ilike('name', `%${collegeName}%`)
      .eq('is_active', true)
      .eq('is_verified', true);

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Fetch college by name error:', error);
    return [];
  }
}

module.exports = router;
