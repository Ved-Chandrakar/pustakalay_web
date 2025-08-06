import React, { useState, useEffect } from 'react';
import { Book, Users, UserCheck, Heart } from 'lucide-react';
import serverUrl from '../pages/server';

interface Stats {
  totalBooks: number;
  totalDonors: number;
  totalLibrarians: number;
  totalDonations: number;
}

const StatsCards: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalDonors: 0,
    totalLibrarians: 0,
    totalDonations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_stats_web.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsData = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: Book,
      description: 'Available in library'
    },
    {
      title: 'Total Donors',
      value: stats.totalDonors,
      icon: Users,
      description: 'Active book donors'
    },
    {
      title: 'Librarians',
      value: stats.totalLibrarians,
      icon: UserCheck,
      description: 'Managing the library'
    },
    {
      title: 'Donations Recorded',
      value: stats.totalDonations,
      icon: Heart,
      description: 'Books donated so far'
    }
  ];

  return (
    <div className="stats-container">
      {error && (
        <div style={{
          background: '#ffe6e6',
          color: '#dc3545',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dc3545',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={fetchStats}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.title} 
            className="stats-card fade-in" 
            style={{ 
              animationDelay: `${index * 0.1}s`,
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            <div className="stats-card-header">
              <div className="stats-card-title">{stat.title}</div>
              <Icon className="stats-card-icon" />
            </div>
            <div className="stats-card-value">
              {isLoading ? '...' : stat.value.toLocaleString()}
            </div>
            <div className="stats-card-description">
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
