import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './theme.css';

// Components
import Login from './components/Login';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import BookList from './pages/BookList';
import BookTransfer from './pages/BookTransfer';
import DonorList from './pages/DonorList';
import LibrarianList from './pages/LibrarianList';
import Footer from './components/Footer';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  count: number;
  category: string;
  donorId: string;
  destination: string;
  addedBy: string;
  addedDate: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalDonations: number;
  lastDonationDate: string;
  donatedBooks: string[];
}

export interface Librarian {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  booksRecorded: number;
  totalDonationsProcessed: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('library_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('library_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        <StatsCards />
        <main className="main-content fade-in">
          <Routes>
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/book-transfer" element={<BookTransfer />} />
            <Route path="/donors" element={<DonorList />} />
            <Route path="/librarians" element={<LibrarianList />} />
            <Route path="*" element={<Navigate to="/books" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
