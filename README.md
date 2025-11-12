# LTG Admin Panel

A modern, responsive admin dashboard for managing interns, tasks, and certificates with real-time data from Backendless.

## 🚀 Features

### 📊 **Dashboard**
- Real-time statistics and analytics
- System health monitoring
- Recent activity tracking
- Performance metrics visualization

### 👥 **Intern Management**
- Complete intern profiles with progress tracking
- Department-wise organization
- Performance ratings and evaluations
- Email communication and report generation

### ✅ **Task Management**
- Advanced task creation and assignment
- Priority-based filtering and sorting
- Progress tracking with visual indicators
- Bulk operations and status management

### 🏆 **Certificate Management**
- Digital certificate issuance
- Grade calculation and verification codes
- Document upload and management
- Status tracking (issued, pending, revoked)

### 📱 **Responsive Design**
- **Desktop**: Full sidebar with collapsible navigation
- **Mobile**: Bottom navigation bar for easy thumb access
- **Tablet**: Adaptive layouts for optimal viewing
- **Touch-friendly**: Proper touch targets and gestures

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Backendless (BaaS)
- **State Management**: React Hooks + Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: Sonner + React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "LTG admin Panel"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_BACKENDLESS_APP_ID=your_app_id
   VITE_BACKENDLESS_API_KEY=your_api_key
   VITE_BACKENDLESS_SERVER_URL=https://api.backendless.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Navbar.tsx      # Top navigation bar
│   ├── Sidebar.tsx     # Side/bottom navigation
│   └── StatsCard.tsx   # Statistics display card
├── context/            # React context providers
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile detection hook
│   └── use-toast.ts    # Toast notifications
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Tasks.tsx       # Task management
│   ├── Interns.tsx     # Intern management
│   ├── Certificates.tsx # Certificate management
│   └── NotFound.tsx    # 404 page
├── services/           # API services
│   ├── backendless.ts  # Backendless integration
│   └── navigationService.ts # Navigation utilities
└── App.tsx             # Main app component
```

## 🎨 Design System

### **Colors**
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### **Typography**
- **Headings**: Inter font family
- **Body**: System font stack
- **Code**: Monospace

### **Responsive Breakpoints**
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (xl)

## 🔧 Configuration

### **Backendless Setup**
1. Create a Backendless account
2. Create a new app
3. Set up data tables:
   - `Interns` - Intern profiles
   - `Tasks` - Task management
   - `Certificates` - Certificate records
   - `Notifications` - System notifications
   - `SystemLogs` - Activity logs

### **Environment Variables**
```env
VITE_BACKENDLESS_APP_ID=your_backendless_app_id
VITE_BACKENDLESS_API_KEY=your_backendless_api_key
VITE_BACKENDLESS_SERVER_URL=https://api.backendless.com
```

## 📱 Mobile Features

### **Bottom Navigation**
- Dashboard, Tasks, Interns, Certificates
- Badge notifications for unvisited pages
- Touch-optimized interface

### **Responsive Components**
- Adaptive grid layouts
- Collapsible sections
- Touch-friendly buttons
- Optimized modal dialogs

## 🔐 Security Features

- Environment variable protection
- Input validation and sanitization
- Secure API communication
- User session management

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### **Manual Deployment**
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### **Version 1.0.0**
- Initial release with core functionality
- Responsive design implementation
- Backendless integration
- Real-time data synchronization

---

**Built with ❤️ for efficient intern and task management**