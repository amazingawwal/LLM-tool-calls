# LLM Function Calling Implementation

A complete implementation demonstrating how to extend Large Language Model (LLM) capabilities using function calling. This project integrates flight booking, hotel booking, and currency conversion tools with both OpenAI (via OpenRouter) API.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How Function Calling Works](#how-function-calling-works)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Function Descriptions](#function-descriptions)
- [How It Works](#how-it-works)
- [API Support](#api-support)
- [Troubleshooting](#troubleshooting)
- [Example Output](#example-output)
- [Technical Details](#technical-details)

## 🎯 Overview

This project demonstrates **function calling** (also known as tool use) with LLMs. Function calling allows AI models to interact with external systems, retrieve real-time data, and perform actions beyond simple text generation.

**The Challenge:** 
> "I'm taking a flight from Lagos to Nairobi for a conference. I would like to know the total flight time back and forth, and the total cost of logistics for this conference if I'm staying for three days."

**The Solution:**
The LLM autonomously decides to call three functions:
1. `get_flight_schedule` - Gets flight information and pricing
2. `get_hotel_booking` - Gets hotel pricing for 3 nights
3. Synthesizes the information into a clear answer

## ✨ Features

### Three Core Functions

1. **Flight Schedule (`get_flight_schedule`)**
   - Returns round-trip flight information
   - Provides total flight time in hours
   - Returns pricing in USD

2. **Hotel Booking (`get_hotel_booking`)**
   - Returns hotel information for specified city
   - Calculates total cost for multiple nights
   - Returns pricing in USD

3. **Currency Conversion (`convert_currency`)**
   - Converts between multiple currencies
   - Supports: USD, EUR, GBP, NGN, KES, JPY, CAD, AUD
   - Provides exchange rates

### Dual API Support

- ✅ **OpenAI SDK** (via OpenRouter) - Access to GPT models
- ✅ Automatic detection based on available API keys

### Smart Features

- ✅ Complete conversation loop handling
- ✅ Multiple sequential function calls
- ✅ Robust error handling
- ✅ Type-safe argument passing
- ✅ Detailed logging and debugging

## 🧠 How Function Calling Works

```
User Query
    ↓
LLM Analyzes Intent
    ↓
LLM Decides Which Functions to Call
    ↓
Returns Structured Function Calls (JSON)
    ↓
Your Code Executes Real Functions
    ↓
Results Sent Back to LLM
    ↓
LLM Synthesizes Natural Language Response
    ↓
Final Answer to User
```

**Example Flow:**

```javascript
# 1. User asks question
"What's the total cost for Lagos to Nairobi with 3 nights stay?"

# 2. LLM decides to call functions
{
  name: "get_flight_schedule",
  arguments: { origin: "Lagos", destination: "Nairobi" }
}

# 3. Your code executes
const flightData = getFlightSchedule("Lagos", "Nairobi");
// Returns: { price_usd: 450, total_flight_time_hours: 10.5, ... }

# 4. LLM calls another function
{
  name: "get_hotel_booking",
  arguments: { city: "Nairobi", num_nights: 3 }
}

#5. Your code executes
const hotelData = getHotelBooking("Nairobi", 3);


#6. LLM synthesizes answer
"The total cost is $810 USD ($450 for flights + $360 for 3 nights accommodation).
Total flight time is 10.5 hours."
```

## 📦 Prerequisites

- **Node.js** 18.0.0 or higher (for ES modules and fetch support)
- **npm** or **yarn**
- An API key from either:
  - [OpenRouter](https://openrouter.ai/) (for OpenAI models)
  - [Google AI Studio](https://makersuite.google.com/app/apikey) (for Gemini)

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd llm-function-calling


### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `openai` (^4.20.0) - OpenAI SDK
- `dotenv` (^16.3.1) - Environment variable management

### Step 3: Verify Installation

```bash
node --version  # Should be 18.0.0 or higher
npm list        # Should show all dependencies installed
```

## ⚙️ Configuration

### Step 1: Create Environment File



### Step 2: Choose Your API Provider

**Option A: OpenRouter (Recommended for GPT models)**

1. Get API key from [OpenRouter](https://openrouter.ai/)
2. Edit `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
LLM_MODEL_NAME=openai/gpt-4-turbo
```

Popular model options:
- `openai/gpt-4-turbo` - Best quality
- `openai/gpt-3.5-turbo` - Fast and cost-effective
- `anthropic/claude-3-opus` - Alternative high-quality model
- `google/gemini-2.0-flash-exp:free` - Free tier

**Option B: Google Gemini**

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Edit `.env`:

```bash
LLM_MODEL_NAME=gemini-pro
```

Model options:
- `gemini-pro` - General purpose
- `gemini-1.5-pro` - Latest version
- `gemini-1.5-flash` - Faster responses

### Priority Order

If both API keys are set, the application uses:
1. **Gemini** (if `GEMINI_API_KEY` is set)
2. **OpenRouter** (if `OPENROUTER_API_KEY` is set)

## 🎮 Usage

### Basic Usage

```bash
node main.js
```

### Expected Output

```
Using Gemini API
Based on the flight and hotel information:

**Flight Details:**
- Route: Lagos → Nairobi (round trip)
- Total flight time: 10.5 hours (5.25 hours each way)
- Airline: Ethiopian Airlines
- Flight cost: $450 USD

**Hotel Details:**
- Hotel: Nairobi Serena Hotel (4.5★)
- Duration: 3 nights
- Rate: $120 per night
- Hotel cost: $360 USD

**Total Conference Logistics Cost: $810 USD**

This includes your complete round-trip flight and 3 nights of accommodation in Nairobi.
```

### Running with Different APIs

```bash
# Using OpenRouter
OPENROUTER_API_KEY=your-key node main.js

```

### Alternative: Using npm script

```bash
npm start
```

## 📁 Project Structure

```
llm-function-calling/
├── main.js              # Main application logic
├── package.json         # Dependencies and scripts
├── .env                 # Your API keys (create this)
├── .env.example         # Environment template
├── README.md           # This file
└── node_modules/       # Dependencies (auto-generated)
```

### File Breakdown

**`main.js`** - Contains:
- Tool implementations (the actual functions)
- Tool definitions (JSON schema for LLM)
- OpenAI/OpenRouter integration
- Main execution logic

**`package.json`** - Defines:
- Project metadata
- Dependencies
- Scripts
- ES module configuration

**`.env`** - Stores:
- API keys (keep secret!)
- Model configuration
- Other settings

## 🔧 Function Descriptions

### 1. `get_flight_schedule(origin, destination)`

**Purpose:** Retrieve flight information between two cities

**Parameters:**
- `origin` (string) - Departure city (e.g., "Lagos")
- `destination` (string) - Arrival city (e.g., "Nairobi")

**Returns:**
```javascript
{
  origin: "Lagos",
  destination: "Nairobi",
  outbound_flight: {
    flight_number: "ET901",
    departure_time: "10:30 AM",
    arrival_time: "5:45 PM",
    duration_hours: 5.25,
    airline: "Ethiopian Airlines"
  },
  return_flight: { /* ... */ },
  total_flight_time_hours: 10.5,
  price_usd: 450.00,
  currency: "USD"
}
```

**Use Case:** Get flight schedules, pricing, and total travel time

### 2. `get_hotel_booking(city, num_nights)`

**Purpose:** Get hotel information and pricing

**Parameters:**
- `city` (string) - City name (e.g., "Nairobi")
- `num_nights` (integer) - Number of nights (e.g., 3)

**Returns:**
```javascript
{
  city: "Nairobi",
  hotel_name: "Nairobi Serena Hotel",
  rating: 4.5,
  price_per_night_usd: 120.00,
  num_nights: 3,
  total_price_usd: 360.00,
  currency: "USD",
  amenities: ["WiFi", "Breakfast", "Pool", "Conference Facilities"]
}
```

**Use Case:** Calculate accommodation costs for trips

### 3. `convert_currency(amount, from_currency, to_currency)`

**Purpose:** Convert between different currencies

**Parameters:**
- `amount` (number) - Amount to convert
- `from_currency` (string) - Source currency code (e.g., "USD")
- `to_currency` (string) - Target currency code (e.g., "NGN")

**Returns:**
```javascript
{
  original_amount: 450,
  from_currency: "USD",
  converted_amount: 711000,
  to_currency: "NGN",
  exchange_rate: 1580
}
```

**Supported Currencies:**
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- NGN (Nigerian Naira)
- KES (Kenyan Shilling)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)

## 🔄 How It Works

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────┐
│  1. User Query Received                         │
│  "Flight from Lagos to Nairobi, 3 nights"      │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  2. Initial API Call to LLM                     │
│  - Send user message                            │
│  - Include tool definitions                     │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  3. LLM Analyzes and Decides                    │
│  - Understands user intent                      │
│  - Determines needed functions                  │
│  - Generates function calls (JSON)              │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  4. Parse Function Calls                        │
│  - Extract function name                        │
│  - Extract arguments                            │
│  - Validate structure                           │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  5. Execute Functions                           │
│  - getFlightSchedule("Lagos", "Nairobi")       │
│  - getHotelBooking("Nairobi", 3)               │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  6. Collect Results                             │
│  - Flight: $450, 10.5 hours                     │
│  - Hotel: $360 for 3 nights                     │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  7. Send Results Back to LLM                    │
│  - Format as tool_result messages               │
│  - Include in conversation history              │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  8. LLM Synthesizes Response                    │
│  - Combines all information                     │
│  - Generates natural language answer            │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  9. Return Final Answer                         │
│  "Total cost: $810 USD..."                      │
└─────────────────────────────────────────────────┘
```

### Key Code Sections

**1. Tool Definition (JSON Schema)**
```javascript
const openaiTools = [
  {
    type: 'function',
    function: {
      name: 'get_flight_schedule',
      description: 'Get flight schedule and pricing...',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', description: '...' },
          destination: { type: 'string', description: '...' }
        },
        required: ['origin', 'destination']
      }
    }
  }
];
```

**2. Function Execution**
```javascript
if (functionName === 'get_flight_schedule') {
  functionResponse = availableFunctions[functionName](
    functionArgs.origin,
    functionArgs.destination
  );
}
```

**3. Conversation Loop**
```javascript
while (response.stop_reason === "tool_use") {
  // Execute tools
  // Send results back
  // Get new response
}
```

## 🌐 API Support

### OpenAI (via OpenRouter)

**Advantages:**
- Access to GPT-4, GPT-3.5, Claude, and more
- Pay-as-you-go pricing
- No rate limits on paid tier
- Multiple model options

**Configuration:**
```javascript
const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});
```


## 📊 Example Output

### Full Conversation Example

```
$ node main.js
Using Gemini API

Based on your query about flying from Lagos to Nairobi for a conference with a 3-day stay, here's the complete breakdown:

**✈️ Flight Information:**
- Route: Lagos (LOS) → Nairobi (NBO) → Lagos (LOS)
- Carrier: Ethiopian Airlines
- Outbound: Flight ET901, departing 10:30 AM, arriving 5:45 PM (5.25 hours)
- Return: Flight ET902, departing 7:00 PM, arriving 12:15 AM+1 (5.25 hours)
- Total flight time: 10 hours 30 minutes (10.5 hours)
- Flight cost: $450.00 USD

**🏨 Accommodation:**
- Hotel: Nairobi Serena Hotel ⭐⭐⭐⭐½
- Location: Nairobi, Kenya
- Duration: 3 nights
- Rate: $120.00 per night
- Amenities: WiFi, Breakfast included, Swimming Pool, Conference Facilities
- Accommodation cost: $360.00 USD

**💰 Total Conference Logistics Cost:**
- Flights: $450.00 USD
- Hotel (3 nights): $360.00 USD
- **Grand Total: $810.00 USD**

**📋 Summary:**
Your total conference logistics will cost $810 USD, which includes round-trip flights from Lagos to Nairobi (10.5 hours total flight time) and 3 nights at the Nairobi Serena Hotel. The hotel offers excellent conference facilities and includes breakfast, making it ideal for your business trip.
```

## 🔬 Technical Details

### Technology Stack

- **Runtime:** Node.js 18+
- **Language:** JavaScript (ES2020+)
- **Module System:** ES Modules (`import`/`export`)
- **APIs:** OpenAI SDK, Google Generative AI SDK
- **Environment:** dotenv for configuration

### Code Architecture

```
┌─────────────────────────────────────┐
│         main.js                      │
├─────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Tool Implementations         │  │
│  │  - getFlightSchedule()        │  │
│  │  - getHotelBooking()          │  │
│  │  - convertCurrency()          │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Tool Definitions (JSON)      │  │
│  │  - OpenAI format              │  │
│  │  - Gemini format              │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  API Integrations             │  │
│  │  - runWithOpenAI()            │  │
│  │  - runWithGemini()            │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Main Entry Point             │  │
│  │  - main()                     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Key Design Decisions

**1. Named Arguments Over Spread Operator**
```javascript
// ✅ Used (type-safe, order-independent)
functionResponse = availableFunctions[functionName](
  functionArgs.city,
  functionArgs.num_nights
);

// ❌ Avoided (order-dependent, fragile)
functionResponse = availableFunctions[functionName](
  ...Object.values(functionArgs)
);
```

**2. If-Else Chain for Function Routing**
- Clear and explicit
- Easy to debug
- Type-safe
- Scalable for small number of functions

**3. Mock Data with Real Structure**
- Functions return realistic data structures
- Easy to swap with real API calls
- Maintains same interface

**4. Robust Input Validation**
```javascript
city = String(city).trim();  // Convert to string first
numNights = parseInt(numNights);  // Ensure integer
```

### Performance Considerations

- **Max Iterations:** Prevents infinite loops (set to 10)
- **API Calls:** Minimized through efficient conversation management
- **Error Handling:** Graceful degradation on failures
- **Memory:** Conversation history kept in memory (consider persistence for production)

### Security Considerations

⚠️ **Important Security Notes:**

1. **API Keys:** Never commit `.env` file to version control
2. **Input Validation:** All function inputs are validated and sanitized
3. **Rate Limiting:** Respect API rate limits to avoid bans
4. **Error Messages:** Don't expose sensitive information in errors
5. **Production Use:** Add authentication, logging, and monitoring

### Extending the Project

**Adding New Functions:**

1. Implement the function:
```javascript
function getWeather(location) {
  // Implementation
  return { temperature: 25, condition: 'Sunny' };
}
```

2. Add to available functions:
```javascript
const availableFunctions = {
  // ... existing functions
  get_weather: getWeather
};
```

3. Define the tool:
```javascript
{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' }
      },
      required: ['location']
    }
  }
}
```

4. Add to function routing:
```javascript
else if (functionName === 'get_weather') {
  functionResponse = availableFunctions[functionName](
    functionArgs.location
  );
}
```

## 📚 Additional Resources

- [OpenAI Function Calling Documentation](https://platform.openai.com/docs/guides/function-calling)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [JSON Schema Guide](https://json-schema.org/learn/getting-started-step-by-step)

## 📝 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 💡 Next Steps

After getting this working, consider:

1. **Add Real APIs:** Replace mock data with actual API calls (Amadeus for flights, Booking.com for hotels)
2. **Persistent Storage:** Save conversation history to a database
3. **Web Interface:** Build a web UI for easier interaction
4. **More Tools:** Add calendar integration, email sending, etc.
5. **Error Recovery:** Implement retry logic and fallbacks
6. **Analytics:** Track function usage and performance
7. **Deploy:** Host on cloud platforms (Vercel, Railway, etc.)



---


Built with ❤️ by @amazingAwwal using Node.js, OpenAI