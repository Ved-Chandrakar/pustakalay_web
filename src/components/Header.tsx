import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../App';
import { Book, Users, UserCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/books', label: 'Books', icon: Book },
    { path: '/donors', label: 'Donors', icon: Users },
    { path: '/librarians', label: 'Librarians', icon: UserCheck }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img 
            src="/src/assets/Pustakalaya 3.png" 
            alt="Pustakalaya Logo"
            className="logo-icon"
            style={{ 
              width: '3.0rem',
              height: '3.0rem',
              objectFit: 'contain'
            }}
          />
          <span>SMRITI PUSTAKALAYA</span>
        </div>

        <nav className="nav">
          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="text-sm">Welcome, {user.name}</span>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
