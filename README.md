# CampusAI - AI-Powered College Chatbot

An intelligent chatbot system designed to assist students and parents in finding the perfect college match through AI-powered conversations, comprehensive college data, and personalized recommendations.

## 🚀 Features

### For Students/Parents
- **AI Chatbot**: Natural language queries about colleges, courses, and admissions
- **College Search**: Advanced filtering by stream, fees, hostel, distance
- **Interactive Maps**: Visual college locations with Google Maps integration
- **Favorites System**: Save and manage preferred colleges
- **Personalized Recommendations**: ML-based college suggestions
- **Subscription Plans**: Premium features with Razorpay integration

### For College Admins
- **Profile Management**: Update college details, courses, facilities
- **Content Upload**: Brochures, images, placement statistics
- **Query Management**: Respond to student inquiries
- **Analytics Dashboard**: Track inquiries and engagement

### For Super Admin
- **System Analytics**: User activity, revenue, popular searches
- **User Management**: Control all users and college admins
- **Content Moderation**: Approve/reject college listings
- **Chatbot Monitoring**: Improve AI responses and track performance

## 🛠 Tech Stack

### Frontend
- **React.js** - User interface
- **TailwindCSS** - Styling
- **Chart.js** - Analytics and data visualization
- **Google Maps API** - Interactive maps
- **Leaflet.js** - Alternative mapping solution

### Backend
- **Node.js/Express.js** - Server framework
- **Python** - ML/AI processing (optional)
- **JWT** - Authentication
- **Supabase** - Database

### AI & Integrations
- **OpenAI API** - GPT-powered chatbot
- **Dialogflow CX/Rasa** - Conversation management
- **Razorpay** - Payment gateway

## 📁 Project Structure

```
CampusAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── ai/                   # AI/ML components
│   ├── chatbot/          # Chatbot logic
│   └── recommendations/  # ML recommendation system
└── docs/                 # Documentation
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusAI
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your environment variables

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
DIALOGFLOW_PROJECT_ID=your_dialogflow_project_id

# Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# JWT
JWT_SECRET=your_jwt_secret
```

## 🎯 Next Steps

1. Set up Supabase database schema
2. Implement user authentication
3. Create basic UI components
4. Integrate AI chatbot
5. Add college data management
6. Implement search and filtering
7. Add payment integration
8. Deploy and test

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License.
