# 🌍 TravelPlanner - AI-Powered Travel Itinerary Management

A comprehensive travel planning application with AI-powered recommendations, collaborative features, and smart budget tracking.

![Travel Planner](https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop)

## ✨ Features

### 🤖 AI-Powered Planning
- **Smart Recommendations** - Get personalized travel suggestions based on your preferences
- **Comprehensive Itineraries** - AI generates detailed day-by-day plans with timing and costs
- **Activity Suggestions** - Intelligent activity recommendations for each day
- **Travel Notes** - AI-generated travel tips and important information

### 👥 Collaborative Planning
- **Real-time Collaboration** - Plan trips together with friends and family
- **Role-based Access** - Owner, Editor, and Viewer permissions
- **Shared Itineraries** - Public and private trip sharing
- **Bill Splitting** - Advanced expense splitting with settlement calculations

### 📊 Smart Budget Management
- **Budget Tracking** - Monitor expenses across categories
- **Expense Categories** - Food, Transport, Accommodation, Entertainment, Shopping, Other
- **Visual Analytics** - Budget usage charts and category breakdowns
- **Cost Optimization** - AI-powered budget recommendations

### 🗓️ Advanced Itinerary Management
- **Drag & Drop** - Intuitive activity reordering between days
- **Day-by-Day Planning** - Organized daily schedules with timing
- **Activity Details** - Locations, costs, booking links, and notes
- **Multi-currency Support** - USD, EUR, GBP, JPY, CAD, AUD, INR

### 🎨 Modern User Experience
- **Dark/Light Mode** - Automatic theme switching
- **Responsive Design** - Works perfectly on all devices
- **Beautiful UI** - Apple-level design aesthetics
- **Smooth Animations** - Micro-interactions and transitions

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Headless UI
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Drag & Drop**: React Beautiful DnD
- **Icons**: Heroicons + Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Yup validation

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/travel-planner.git
cd travel-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. **Set up Supabase**
- Create a new Supabase project
- Run the migrations in the `supabase/migrations` folder
- Enable Row Level Security (RLS)

5. **Start development server**
```bash
npm run dev
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles** - User profiles and preferences
- **trips** - Trip information and settings
- **activities** - Daily activities and itinerary items
- **expenses** - Individual expense tracking
- **shared_expenses** - Collaborative expense splitting
- **trip_collaborators** - Trip sharing and permissions
- **trip_notes** - Personal and shared notes
- **destinations** - Curated destination database

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | ⚠️ Optional* |

*AI features will be disabled without OpenAI API key

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Docker
```bash
docker build -t travel-planner .
docker run -p 3000:3000 travel-planner
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-3.5 Turbo API
- **Supabase** for backend infrastructure
- **Pexels** for beautiful stock photos
- **Heroicons & Lucide** for amazing icons
- **Tailwind CSS** for utility-first styling

## 📞 Support

- 📧 Email: support@travelplanner.com
- 💬 Discord: [Join our community](https://discord.gg/travelplanner)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/travel-planner/issues)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode support
- [ ] Advanced AI trip optimization
- [ ] Integration with booking platforms
- [ ] Social features and trip sharing
- [ ] Multi-language support
- [ ] Weather integration
- [ ] Flight and hotel price tracking

---

Made with ❤️ by the TravelPlanner team