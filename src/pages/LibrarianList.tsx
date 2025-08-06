import React, { useState, useEffect } from 'react';
import type { Librarian } from '../App';
import { Plus, Edit3, Trash2, Eye, Search, BookOpen, Save, X, User, Mail, Phone, Calendar, Award } from 'lucide-react';
import serverUrl from './server';

const LibrarianList: React.FC = () => {
  const [librarians, setLibrarians] = useState<Librarian[]>([]);
  const [filteredLibrarians, setFilteredLibrarians] = useState<Librarian[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState<Librarian | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state for add/edit modal
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Fetch librarians from backend
  const fetchLibrarians = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_librarians_management_web.php?action=fetch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setLibrarians(result.data);
      } else {
        setError(result.message || 'Failed to fetch librarians');
      }
    } catch (error) {
      console.error('Fetch librarians error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with real data
  useEffect(() => {
    fetchLibrarians();
  }, []);

  // Filter librarians based on search
  useEffect(() => {
    let filtered = librarians;

    if (searchTerm) {
      filtered = filtered.filter(librarian =>
        librarian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        librarian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        librarian.phone.includes(searchTerm)
      );
    }

    setFilteredLibrarians(filtered);
  }, [librarians, searchTerm]);

  const handleAdd = () => {
    setSelectedLibrarian(null);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (librarian: Librarian) => {
    setSelectedLibrarian(librarian);
    setError('');
    setFormData({
      name: librarian.name,
      email: librarian.email,
      phone: librarian.phone,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleView = (librarian: Librarian) => {
    setSelectedLibrarian(librarian);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (librarianId: string) => {
    if (window.confirm('Are you sure you want to delete this librarian?')) {
      try {
        setError('');
        
        const response = await fetch(`${serverUrl}p_librarians_management_web.php?action=delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            librarianId: librarianId
          })
        });

        const result = await response.json();

        if (result.success) {
          // Remove from local state
          setLibrarians(librarians.filter(librarian => librarian.id !== librarianId));
        } else {
          setError(result.message || 'Failed to delete librarian');
        }
      } catch (error) {
        console.error('Delete librarian error:', error);
        setError('Network error. Please try again.');
      }
    }
  };

  const handleSave = async (librarianData: Omit<Librarian, 'id'>) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (selectedLibrarian) {
        // Edit existing librarian
        const response = await fetch(`${serverUrl}p_librarians_management_web.php?action=update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedLibrarian.id,
            name: librarianData.name,
            email: librarianData.email,
            phone: librarianData.phone,
            password: formData.password || undefined
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update local state
          setLibrarians(librarians.map(librarian =>
            librarian.id === selectedLibrarian.id
              ? result.data
              : librarian
          ));
          setIsModalOpen(false);
        } else {
          setError(result.message || 'Failed to update librarian');
        }
      } else {
        // Add new librarian
        const response = await fetch(`${serverUrl}p_librarians_management_web.php?action=add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: librarianData.name,
            email: librarianData.email,
            phone: librarianData.phone,
            password: formData.password
          })
        });

        const result = await response.json();

        if (result.success) {
          // Add to local state
          setLibrarians([...librarians, result.data]);
          setIsModalOpen(false);
        } else {
          setError(result.message || 'Failed to add librarian');
        }
      }
    } catch (error) {
      console.error('Save librarian error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form handlers for inline modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const librarianData: Omit<Librarian, 'id'> = {
      ...formData,
      joinDate: selectedLibrarian?.joinDate || new Date().toISOString().split('T')[0],
      booksRecorded: selectedLibrarian?.booksRecorded || 0,
      totalDonationsProcessed: selectedLibrarian?.totalDonationsProcessed || 0
    };
    handleSave(librarianData);
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner"></div>
        <p className="mt-2">Loading librarians...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Librarian Management</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus size={20} />
          Add New Librarian
        </button>
      </div>

      {/* Error Display */}
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
            onClick={fetchLibrarians}
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

      {/* Search */}
      <div className="card mb-4">
        <div className="form-group" style={{ minWidth: '100%' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--dark-gray)'
            }} />
            <input
              type="text"
              placeholder="Search librarians by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ 
                paddingLeft: '3rem',
                width: '100%',
                height: '3rem',
                fontSize: '1.1rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Librarians Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredLibrarians.length > 0 ? (
          filteredLibrarians.map((librarian) => (
            <div key={librarian.id} className="card">
              <div className="card-header">
                <div className="d-flex align-items-center gap-3">
                  <BookOpen size={40} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <h3 className="card-title">{librarian.name}</h3>
                    <p className="card-subtitle">{librarian.email}</p>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex justify-content-between">
                  <span>Phone:</span>
                  <strong>{librarian.phone}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Join Date:</span>
                  <strong>{new Date(librarian.joinDate).toLocaleDateString()}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Books Recorded:</span>
                  <span className="badge badge-success">{librarian.booksRecorded}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Donors:</span>
                  <span className="badge badge-info">{librarian.totalDonationsProcessed}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => handleView(librarian)}
                  className="btn btn-secondary btn-sm"
                  title="View Details"
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={() => handleEdit(librarian)}
                  className="btn btn-warning btn-sm"
                  title="Edit Librarian"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(librarian.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete Librarian"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4" style={{ gridColumn: '1 / -1' }}>
            <BookOpen size={48} style={{ color: 'var(--medium-gray)' }} />
            <p className="mt-3" style={{ color: 'var(--dark-gray)' }}>
              No librarians found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedLibrarian ? 'Edit Librarian' : 'Add New Librarian'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    background: '#ffe6e6',
                    color: '#dc3545',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #dc3545',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {error}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={16} />
                  {isSubmitting 
                    ? (selectedLibrarian ? 'Updating...' : 'Adding...') 
                    : (selectedLibrarian ? 'Update Librarian' : 'Add Librarian')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedLibrarian && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Librarian Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="card">
                <div className="d-flex align-items-start gap-3 mb-4">
                  <User size={48} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <h3 className="card-title">{selectedLibrarian.name}</h3>
                    <p className="card-subtitle">Librarian ID: {selectedLibrarian.id}</p>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <Mail size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Email:</strong> {selectedLibrarian.email}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Phone size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Phone:</strong> {selectedLibrarian.phone}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Join Date:</strong> {new Date(selectedLibrarian.joinDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="card" style={{ backgroundColor: 'var(--light-gray)', border: 'none', marginBottom: '0' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                    Performance Statistics
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    <div className="text-center">
                      <BookOpen size={32} style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                        {selectedLibrarian.booksRecorded}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--dark-gray)' }}>
                        Books Recorded
                      </div>
                    </div>

                    <div className="text-center">
                      <Award size={32} style={{ color: 'var(--info-color)', marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info-color)' }}>
                        {selectedLibrarian.totalDonationsProcessed}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--dark-gray)' }}>
                        Donations Processed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsViewModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarianList;
