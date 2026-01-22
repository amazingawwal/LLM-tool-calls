import "dotenv/config";
import OpenAI from 'openai';




const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY;

const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME


// FLIGHT SCHEDULE FUNCTION
function getFlightSchedule(origin, destination) {
  
  const flightDatabase = {
    'Lagos-Nairobi': {
      origin: 'Lagos',
      destination: 'Nairobi',
      outbound_flight: {
        flight_number: 'ET901',
        departure_time: '10:30 AM',
        arrival_time: '5:45 PM',
        duration_hours: 5.25,
        airline: 'Ethiopian Airlines'
      },
      return_flight: {
        flight_number: 'ET902',
        departure_time: '7:00 PM',
        arrival_time: '12:15 AM+1',
        duration_hours: 5.25,
        airline: 'Ethiopian Airlines'
      },
      total_flight_time_hours: 10.5,
      price_usd: 450.00,
      currency: 'USD'
    },
    'Nairobi-Lagos': {
      origin: 'Nairobi',
      destination: 'Lagos',
      outbound_flight: {
        flight_number: 'ET902',
        departure_time: '7:00 PM',
        arrival_time: '12:15 AM+1',
        duration_hours: 5.25,
        airline: 'Ethiopian Airlines'
      },
      return_flight: {
        flight_number: 'ET901',
        departure_time: '10:30 AM',
        arrival_time: '5:45 PM',
        duration_hours: 5.25,
        airline: 'Ethiopian Airlines'
      },
      total_flight_time_hours: 10.5,
      price_usd: 450.00,
      currency: 'USD'
    }
  };

  
  origin = origin.trim().replace(/\b\w/g, c => c.toUpperCase());
  destination = destination.trim().replace(/\b\w/g, c => c.toUpperCase());


  const flightKey = `${origin}-${destination}`;
  if (flightDatabase[flightKey]) {
    return flightDatabase[flightKey];
  }

 
  return {
    origin,
    destination,
    total_flight_time_hours: 6.0,
    price_usd: 500.00,
    currency: 'USD',
    note: 'Generic pricing - specific route not in database'
  };
}


// HOTEL BOOKING FUNCTION
function getHotelBooking(city, numOfNights) {
 
  const hotelData = {
    'Nairobi': {
      city: 'Nairobi',
      hotel_name: 'Nairobi Serena Hotel',
      rating: 4.5,
      price_per_night_usd: 120.00,
      currency: 'USD',
      amenities: ['WiFi', 'Breakfast', 'Pool', 'Conference Facilities']
    },
    'Lagos': {
      city: 'Lagos',
      hotel_name: 'Eko Hotels & Suites',
      rating: 4.5,
      price_per_night_usd: 150.00,
      currency: 'USD',
      amenities: ['WiFi', 'Breakfast', 'Pool', 'Conference Facilities']
    }
  };

  city = city.trim().replace(/\b\w/g, c => c.toUpperCase());
  numOfNights = parseInt(numOfNights);

  
  if (hotelData[city]) {
    const hotelInfo = { ...hotelData[city] };
    hotelInfo.num_nights = numOfNights;
    hotelInfo.total_price_usd = hotelInfo.price_per_night_usd * numOfNights;
    return hotelInfo;
  }

  
  return {
    city,
    num_nights: numOfNights,
    price_per_night_usd: 100.00,
    total_price_usd: 100.00 * numOfNights,
    currency: 'USD',
    note: 'Generic pricing - city not in database'
  };
}


// CURRENCY CONVERSION FUNCTION
function convertCurrency(amount, fromCurrency, toCurrency) {

  const exchangeRates = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'NGN': 1580.0,  
    'KES': 129.0, 
    'JPY': 149.0,
    'CAD': 1.36,
    'AUD': 1.52
  };

  
  fromCurrency = fromCurrency.trim().toUpperCase();
  toCurrency = toCurrency.trim().toUpperCase();
  amount = parseFloat(amount);

  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    return {
      error: `Currency not supported. Supported: ${Object.keys(exchangeRates).join(', ')}`,
      original_amount: amount,
      from_currency: fromCurrency,
      to_currency: toCurrency
    };
  }

  
  const amountInUsd = amount / exchangeRates[fromCurrency];
  const convertedAmount = amountInUsd * exchangeRates[toCurrency];

  return {
    original_amount: amount,
    from_currency: fromCurrency,
    converted_amount: Math.round(convertedAmount * 100) / 100,
    to_currency: toCurrency,
    exchange_rate: Math.round((exchangeRates[toCurrency] / exchangeRates[fromCurrency]) * 10000) / 10000
  };
}

// Adding function names to implementations
const availableFunctions = {
  get_flight_schedule: getFlightSchedule,
  get_hotel_booking: getHotelBooking,
  convert_currency: convertCurrency
};

// OpenAI TOOLS
const openaiTools = [
  {
    type: 'function',
    function: {
      name: 'get_flight_schedule',
      description: 'Get flight schedule and pricing between two cities. Returns flight details including total flight time and pricing in USD.',
      parameters: {
        type: 'object',
        properties: {
          origin: {
            type: 'string',
            description: "Origin city name (e.g., 'Lagos', 'New York')"
          },
          destination: {
            type: 'string',
            description: "Destination city name (e.g., 'Nairobi', 'London')"
          }
        },
        required: ['origin', 'destination']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_hotel_booking',
      description: 'Get hotel booking information and pricing for a city. Returns hotel details with pricing in USD.',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: "City name where hotel is needed (e.g., 'Nairobi', 'London')"
          },
          num_nights: {
            type: 'integer',
            description: 'Number of nights to stay'
          }
        },
        required: ['city', 'num_nights']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'convert_currency',
      description: 'Convert an amount from one currency to another. Supports USD, EUR, GBP, NGN (Nigerian Naira), KES (Kenyan Shilling), JPY, CAD, AUD.',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Amount to convert'
          },
          from_currency: {
            type: 'string',
            description: "Source currency code (e.g., 'USD', 'EUR', 'NGN')"
          },
          to_currency: {
            type: 'string',
            description: "Target currency code (e.g., 'USD', 'EUR', 'KES')"
          }
        },
        required: ['amount', 'from_currency', 'to_currency']
      }
    }
  }
];


// OpenAI Implementation

async function runWithOpenAI() {
  const client = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  });

  const userPrompt = "I'm taking a flight from Lagos to Nairobi for a conference. I would like to know the total flight time back and forth, and the total cost of logistics in NGN for this conference if I'm staying for three days.";

  const messages = [{ role: 'user', content: userPrompt }];

  const maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const response = await client.chat.completions.create({
      model: LLM_MODEL_NAME,
      messages: messages,
      tools: openaiTools,
      tool_choice: 'auto'
    });

    const assistantMessage = response.choices[0].message;

    
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
     
      const finalResponse = assistantMessage.content;
      console.log(finalResponse);
      return;
    }

    
    messages.push({
      role: 'assistant',
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls
    });

  
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      
      let functionResponse;
      if (availableFunctions[functionName]) {
        functionResponse = availableFunctions[functionName](...Object.values(functionArgs));
      } else {
        functionResponse = { error: `Unknown function: ${functionName}` };
      }

      
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(functionResponse)
      });
    }
  }

  console.log('Error: Maximum iterations reached without completion');
}


async function main() {
    try {
        await runWithOpenAI();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();