const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI features will be disabled.');
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenAIService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = OPENAI_API_KEY;
  }

  async generateTravelRecommendations(destination: string, interests: string[], budget?: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate travel recommendations for ${destination}. 
    User interests: ${interests.join(', ')}
    ${budget ? `Budget: $${budget}` : ''}
    
    Please provide:
    1. Top 3 must-visit attractions
    2. 2-3 recommended restaurants
    3. Best time to visit
    4. Local tips and hidden gems
    
    Keep the response concise and practical.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful travel planning assistant. Provide practical, accurate travel advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No recommendations available';
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      throw error;
    }
  }

  async generateItinerary(destination: string, days: number, interests: string[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a ${days}-day itinerary for ${destination}.
    User interests: ${interests.join(', ')}
    
    Format as a day-by-day plan with:
    - Morning, afternoon, and evening activities
    - Estimated time for each activity
    - Transportation suggestions
    - Meal recommendations
    
    Keep it practical and well-paced.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a travel planning expert. Create detailed, practical itineraries.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No itinerary available';
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }

  async optimizeBudget(expenses: Array<{ category: string; amount: number }>, totalBudget: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const expenseBreakdown = expenses.map(e => `${e.category}: $${e.amount}`).join(', ');
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `Analyze this travel budget:
    Total Budget: $${totalBudget}
    Total Spent: $${totalSpent}
    Expenses: ${expenseBreakdown}
    
    Provide:
    1. Budget analysis (over/under budget)
    2. Spending recommendations
    3. Areas to save money
    4. Suggestions for remaining budget
    
    Keep advice practical and specific.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a financial advisor specializing in travel budgets. Provide practical money-saving advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No budget analysis available';
    } catch (error) {
      console.error('Error analyzing budget:', error);
      throw error;
    }
  }

  async generateActivities(destination: string, days: number, interests: string[], budget?: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a detailed ${days}-day activity plan for ${destination}.
    User interests: ${interests.join(', ')}
    ${budget ? `Daily budget: $${Math.round(budget / days)}` : ''}
    
    For each day, provide:
    - 3-4 activities with specific names and locations
    - Estimated duration and cost for each activity
    - Best times to visit
    - Brief description of why it's recommended
    
    Format as:
    Day 1:
    - Activity Name (Location) - Duration, Cost - Description
    
    Keep recommendations practical and well-timed.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a travel planning expert. Create detailed, practical activity recommendations with specific locations and timing.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No activities available';
    } catch (error) {
      console.error('Error generating activities:', error);
      throw error;
    }
  }

  async generateNotes(tripTitle: string, destination: string, activities: string[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate helpful travel notes for a trip to ${destination} titled "${tripTitle}".
    Planned activities: ${activities.join(', ')}
    
    Provide practical notes including:
    - Important things to know before visiting
    - Local customs and etiquette tips
    - Transportation recommendations
    - What to pack specifically for these activities
    - Safety considerations
    - Money and payment tips
    - Best local food to try
    - Emergency contacts or useful phrases
    
    Keep it concise but comprehensive.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable travel advisor. Provide practical, actionable travel notes and tips.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No notes available';
    } catch (error) {
      console.error('Error generating notes:', error);
      throw error;
    }
  }

  async generateComprehensivePlan(destination: string, days: number, interests: string[], budget?: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a comprehensive ${days}-day travel plan for ${destination}.
    User interests: ${interests.join(', ')}
    ${budget ? `Total budget: $${budget}` : ''}
    
    Please provide:
    
    TRAVEL OVERVIEW & RECOMMENDATIONS:
    - Best time to visit and weather expectations
    - Top 3 must-visit attractions with brief descriptions
    - 2-3 recommended restaurants/local cuisine
    - Transportation tips (airport to city, getting around)
    - Local customs and cultural tips
    - Budget breakdown suggestions
    - Hidden gems and local favorites
    
    DETAILED ${days}-DAY ITINERARY:
    For each day, provide a structured schedule with:
    
    Day 1:
    - 9:00 AM - Activity Name (Specific Location) - 2 hours - $25 - Brief description of what to expect and why it's recommended
    - 12:00 PM - Lunch at Restaurant Name (Address) - 1 hour - $15 - Type of cuisine and specialties
    - 2:00 PM - Next Activity (Location) - 3 hours - $30 - What you'll see/do and tips
    
    Continue this format for all ${days} days.
    
    Include:
    - Specific times for each activity
    - Exact locations/addresses when possible
    - Estimated duration for each activity
    - Cost estimates
    - Brief descriptions explaining why each activity is recommended
    - Logical flow between activities (consider travel time)
    - Mix of must-see attractions, local experiences, meals, and rest time
    - Consider opening hours and optimal visiting times
    
    Keep the plan realistic and well-paced with appropriate breaks.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert travel planner. Create detailed, practical itineraries with specific times, locations, costs, and descriptions. Format your response clearly with sections for overview/recommendations and day-by-day itinerary.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.');
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'No comprehensive plan available';
    } catch (error) {
      console.error('Error generating comprehensive plan:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openAIService = new OpenAIService();