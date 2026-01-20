import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const LLM_MODEL_NAME = process.env.LLM_MODEL_NAME

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

  // Normalize city names
  origin = origin.trim().replace(/\b\w/g, c => c.toUpperCase());
  destination = destination.trim().replace(/\b\w/g, c => c.toUpperCase());

  // Look up flight
  const flightKey = `${origin}-${destination}`;
  if (flightDatabase[flightKey]) {
    return flightDatabase[flightKey];
  }

  // Return generic data if route not found
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

  // Normalize city name
  city = city.trim().replace(/\b\w/g, c => c.toUpperCase());
  numOfNights = parseInt(numOfNights);

  // Look up hotel
  if (hotelData[city]) {
    const hotelInfo = { ...hotelData[city] };
    hotelInfo.num_nights = numOfNights;
    hotelInfo.total_price_usd = hotelInfo.price_per_night_usd * numOfNights;
    return hotelInfo;
  }

  // Return generic data if city not found
  return {
    city,
    num_nights: numOfNights,
    price_per_night_usd: 100.00,
    total_price_usd: 100.00 * numOfNights,
    currency: 'USD',
    note: 'Generic pricing - city not in database'
  };
}

function convertCurrency(amount, fromCurrency, toCurrency) {

  const exchangeRates = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'NGN': 1580.0,  // Nigerian Naira
    'KES': 129.0,   // Kenyan Shilling
    'JPY': 149.0,
    'CAD': 1.36,
    'AUD': 1.52
  };

  // Normalize currency codes
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

  // Convert to USD first, then to target currency
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

// Map function names to implementations
const availableFunction = {
  get_flight_schedule: getFlightSchedule,
  get_hotel_booking: getHotelBooking,
  convert_currency: convertCurrency
};

// OpenAPI TOOLS

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