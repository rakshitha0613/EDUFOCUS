# 🎓 EduFocus - Complete Smart Learning Platform

A comprehensive student learning platform with AI-powered focus tracking, PDF summarization, beautiful UI, and interactive study materials.

## ✨ What's New - Enhanced Experience!

🔐 **Beautiful Login System** - Stunning authentication with particle effects  
🎉 **Welcome Screen** - Personalized onboarding experience  
🎨 **Ultra-Modern UI** - Glassmorphism design with smooth animations  
🔄 **Session Management** - Smart login/logout with auto-extension  
📱 **Mobile Optimized** - Perfect experience on all devices

## 🌟 Features

### 🎯 Focus Tracking
- **Real-time camera monitoring** to track student attention levels
- **Eye tracking technology** using face detection APIs
- **Focus analytics** with detailed charts and statistics
- **Session management** with start/stop controls
- **Data persistence** to track progress over time

### 📄 PDF Summarization
- **AI-powered summarization** using OpenAI GPT-3.5-turbo
- **Drag-and-drop upload** for easy file handling
- **Comprehensive summaries** with key topics, takeaways, and study tips
- **Fallback mode** for offline functionality
- **Progress tracking** of summarized documents

### 📚 Study Materials
- **Multiple subjects** including Mathematics, Computer Science, Science, Languages, History, and Arts
- **Interactive learning paths** for different skill levels
- **Programming language resources** with hands-on tools
- **Practice exercises** and quizzes
- **Progress tracking** per subject

### 📊 Analytics Dashboard
- **Real-time statistics** showing study time, focus levels, and achievements
- **Interactive charts** displaying focus trends over time
- **Activity tracking** with detailed session logs
- **Insights and recommendations** based on performance
- **Data export** functionality

### 🔧 Study Tools
- **Pomodoro timer** for focused study sessions
- **Flashcards** for memorization
- **Todo lists** for task management
- **Progress trackers** for goal setting

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera access for focus tracking
- Internet connection for PDF summarization
- OpenAI API key (provided)

### Installation

1. **Download or clone the project files**
   ```
   git clone <repository-url>
   cd edu-tech
   ```

2. **Open the website**
   - Simply open `index.html` in your web browser
   - Or use a local web server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using Live Server extension in VS Code
     ```

3. **Access the website**
   - Open your browser and go to `http://localhost:8000` (if using local server)
   - Or directly open the `index.html` file

## 📖 How to Use

### 1. Focus Tracking
1. Navigate to the **Focus Tracker** section
2. Click **"Start Tracking"** to begin monitoring
3. Allow camera access when prompted
4. Position yourself in front of the camera
5. The system will track your focus levels in real-time
6. Click **"Stop Tracking"** to end the session

### 2. PDF Summarization
1. Go to the **PDF Summarizer** section
2. Upload a PDF file by:
   - Clicking **"Choose File"** button
   - Or dragging and dropping the file
3. Wait for the AI to process and summarize
4. Review the comprehensive summary with key insights
5. Use the **"Upload Another"** button for additional files

### 3. Study Materials
1. Visit the **Study Materials** section
2. Choose from available subjects
3. Click on any subject card to explore resources
4. Access interactive tools and practice exercises
5. Track your progress through each topic

### 4. Dashboard
1. Check the **Dashboard** for your statistics
2. View focus trends and study time
3. Review recent activity and achievements
4. Export your data for external analysis

## 🛠️ Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Charts**: Chart.js for data visualization
- **Face Detection**: Face-api.js library
- **PDF Processing**: PDF.js library
- **AI Integration**: OpenAI API for text summarization

### File Structure
```
edu-tech/
├── index.html              # Main homepage
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── app.js             # Main application logic
│   ├── focus-tracker.js   # Focus tracking functionality
│   ├── pdf-summarizer.js  # PDF processing and AI integration
│   └── dashboard.js       # Analytics and charts
├── pages/
│   ├── mathematics.html   # Mathematics resources
│   └── computer-science.html # Computer Science resources
└── images/                # Image assets
```

### Browser Compatibility
- Chrome 70+ ✅
- Firefox 65+ ✅
- Safari 12+ ✅
- Edge 79+ ✅

### Performance Features
- **Lazy loading** for better performance
- **Responsive design** for all devices
- **Local storage** for offline data persistence
- **Progressive enhancement** for graceful degradation

## 🔧 Configuration

### OpenAI API Key
The OpenAI API key is already configured in the code. If you need to update it:

1. Open `js/pdf-summarizer.js`
2. Update the `apiKey` variable with your new key
3. Ensure you have sufficient API credits

### Focus Tracking Sensitivity
Adjust focus tracking sensitivity in the Profile section:
1. Go to **Profile** > **Preferences**
2. Use the **Focus Sensitivity** slider (1-10)
3. Higher values = more sensitive detection

## 🎨 UI Features

### Modern Design
- **Gradient backgrounds** with professional color scheme
- **Glass morphism effects** for modern appearance
- **Smooth animations** and transitions
- **Interactive hover effects**
- **Responsive layout** for all screen sizes

### Accessibility
- **High contrast** color combinations
- **Keyboard navigation** support
- **Screen reader** friendly markup
- **Focus indicators** for better usability

## 📱 Mobile Support

The website is fully responsive and works on:
- 📱 **Smartphones** (iOS/Android)
- 📊 **Tablets** (iPad, Android tablets)
- 💻 **Laptops** (All screen sizes)
- 🖥️ **Desktops** (All resolutions)

### Mobile Features
- Touch-friendly interface
- Swipe gestures support
- Mobile-optimized navigation
- Responsive text and images

## 🔒 Privacy & Security

### Data Handling
- **Local storage** only - no data sent to external servers (except OpenAI for summarization)
- **Camera data** processed locally - never stored or transmitted
- **PDF content** only sent to OpenAI for summarization
- **User preferences** stored locally in browser

### Security Features
- **HTTPS required** for camera access
- **No user registration** required
- **Privacy-focused** design
- **Secure API** communication

## 🎯 Study Tips for Maximum Effectiveness

### Using Focus Tracking
1. **Sit up straight** and face the camera directly
2. **Minimize distractions** in your environment
3. **Take breaks** when focus levels drop
4. **Review analytics** to identify patterns

### PDF Summarization Best Practices
1. **Upload clear PDFs** with readable text
2. **Start with shorter documents** to test the system
3. **Review summaries carefully** and take notes
4. **Use summaries as study guides**, not replacements for reading

### Study Planning
1. **Set daily goals** using the dashboard
2. **Use the Pomodoro timer** for focused sessions
3. **Track progress** across different subjects
4. **Review analytics** weekly to adjust study habits

## 🔧 Troubleshooting

### Common Issues

**Camera not working:**
- Ensure camera permissions are granted
- Check if camera is being used by another application
- Try refreshing the page and allowing permissions again

**PDF upload fails:**
- Check file size (must be under 10MB)
- Ensure file is a valid PDF format
- Try with a different PDF file

**Focus tracking inaccurate:**
- Improve lighting conditions
- Position camera at eye level
- Adjust sensitivity in settings
- Minimize background movement

**Charts not displaying:**
- Ensure JavaScript is enabled
- Check browser compatibility
- Clear browser cache and reload

## 🌟 Advanced Features

### Keyboard Shortcuts
- `Ctrl/Cmd + D` - Go to Dashboard
- `Ctrl/Cmd + F` - Start Focus Tracking
- `Ctrl/Cmd + P` - Open PDF Summarizer
- `Ctrl/Cmd + S` - Open Study Materials

### Data Export
1. Go to Dashboard
2. Click **"Export Data"** button
3. Save the JSON file with all your data
4. Import later or use with external tools

### Custom Themes
The website supports preference customization:
- Light/Dark mode toggle
- Focus sensitivity adjustment
- Notification preferences

## 🎓 Educational Benefits

### For Students
- **Improved focus** through real-time monitoring
- **Better comprehension** with AI-generated summaries
- **Organized learning** with structured materials
- **Progress tracking** for motivation

### For Educators
- **Student engagement insights** through analytics
- **Study pattern analysis** for better guidance
- **Resource organization** with categorized materials
- **Performance tracking** across subjects

## 📞 Support

If you encounter any issues or need help:

1. **Check this README** for common solutions
2. **Review browser console** for error messages
3. **Ensure all permissions** are granted
4. **Try in a different browser** if issues persist

## 🚧 Future Enhancements

Planned features for future versions:
- **Voice recognition** for hands-free control
- **Collaborative study** rooms
- **Advanced AI tutoring** with personalized responses
- **Integration with learning management systems**
- **Offline mode** with local AI models
- **Mobile app** for iOS and Android

## 🙏 Acknowledgments

This project uses several open-source libraries and services:
- **Chart.js** for data visualization
- **Face-api.js** for face detection
- **PDF.js** for PDF processing
- **OpenAI API** for text summarization
- **Font Awesome** for icons
- **Inter Font** for typography

---

**Happy Learning! 🎓✨**

Start your focused learning journey today and track your progress with EduFocus!