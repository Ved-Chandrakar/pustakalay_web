# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# SSIPMT Government Library Management System

A modern, responsive library management system built for government institutions using React 18, TypeScript, and Vite.

## 🏛️ Features

### 📚 Core Functionality
- **Book Management**: Complete CRUD operations for book inventory
- **Donor Management**: Track book donors and their contributions  
- **Librarian Management**: Staff management with performance tracking
- **Authentication**: Secure login system with role-based access
- **Dashboard**: Real-time statistics and metrics

### 🎨 Design & UX
- **Government Theme**: Professional color scheme (#004E92, #0D1452)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant interface
- **Modern UI**: Clean, intuitive government-standard design

### 🔧 Technical Features
- **React 18**: Latest React with functional components and hooks
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Lightning-fast build tool and development server
- **React Router v6**: Client-side routing with protected routes
- **Lucide Icons**: Beautiful, consistent iconography
- **CSS Variables**: Centralized theming system

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pustakale
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
pustakale/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Login.tsx
│   │   ├── Header.tsx
│   │   ├── StatsCards.tsx
│   │   ├── Footer.tsx
│   │   ├── BookModal.tsx
│   │   ├── DonorModal.tsx
│   │   └── LibrarianModal.tsx
│   ├── pages/              # Main application pages
│   │   ├── BookList.tsx
│   │   ├── DonorList.tsx
│   │   └── LibrarianList.tsx
│   ├── theme.css           # Centralized styling system
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🔐 Authentication

The system includes a secure login interface with:
- Email-based authentication
- Password protection
- Session management
- Role-based access control

**Default Access**: Use any valid email and password to access the system (demo mode)

## 📊 Dashboard

The main dashboard provides:
- **Total Books**: Complete inventory count
- **Active Donors**: Number of book contributors
- **Librarians**: Staff member count
- **Donations Recorded**: Total processed donations

## 📖 Book Management

Comprehensive book management features:
- ✅ Add new books to inventory
- ✅ Edit existing book details
- ✅ View detailed book information
- ✅ Delete books from system
- ✅ Search and filter capabilities
- ✅ Status tracking (Available/Issued/Damaged)

## 👥 Donor Management

Track and manage book donors:
- ✅ Donor contact information
- ✅ Donation history tracking
- ✅ Detailed donated books popup
- ✅ Donation statistics
- ✅ Search functionality

## 👨‍💼 Librarian Management

Staff management system:
- ✅ Librarian profiles and contact details
- ✅ Performance tracking (books recorded)
- ✅ Donation processing statistics
- ✅ Service tenure tracking
- ✅ Grid-based card layout

## 🎨 Theming System

Centralized CSS theming with:
- **Government Colors**: #004E92 (Primary), #0D1452 (Secondary)
- **CSS Custom Properties**: Consistent design tokens
- **Responsive Grid**: Flexible layouts for all screen sizes
- **Accessibility**: High contrast and readable fonts
- **Animation**: Smooth transitions and micro-interactions

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: CSS Custom Properties, Responsive Design

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interfaces
- Adaptive layouts for all screen sizes
- Optimized navigation for mobile devices

## 🔒 Security Features

- Input validation on all forms
- XSS protection
- Secure authentication flow
- Protected route access
- Data sanitization

## 🏛️ Government Compliance

Built following government standards:
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: Industry-standard security practices
- **Performance**: Optimized for government networks
- **Branding**: Professional government aesthetic
- **Documentation**: Comprehensive user guides

## 👨‍💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Semantic commit messages
- Component-based architecture

## 📄 Version

**Version 1.0** - Powered by SSIPMT

## 🤝 Support

For support and questions, contact the SSIPMT IT Department.

---

**Powered by SSIPMT - Government Library Management System v1.0**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
