import React, { useState, useEffect } from 'react';
import type { Donor, Book } from '../App';
import { Edit3, Trash2, Eye, Search, Gift, X, Save, User, Phone, Calendar, Tag, Book as BookIcon, ChevronLeft, ChevronRight, Image, FileText } from 'lucide-react';
import serverUrl from './server';

interface DonatedBook extends Book {
  donationDate: string;
}

interface DonationCertificate {
  f_id: number;
  f_path: string;
  f_createdat: string;
  f_updatedat: string;
}

const DonorList: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDonatedBooksModalOpen, setIsDonatedBooksModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [donatedBooks, setDonatedBooks] = useState<DonatedBook[]>([]);
  const [isDonatedBooksLoading, setIsDonatedBooksLoading] = useState(false);
  const [donationCertificate, setDonationCertificate] = useState<DonationCertificate | null>(null);
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 10;

  // Fetch donors from backend
  const fetchDonors = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_donors_management_web.php?action=fetch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setDonors(result.data);
      } else {
        setError(result.message || 'Failed to fetch donors');
      }
    } catch (error) {
      console.error('Fetch donors error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with real data
  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter donors based on search
  useEffect(() => {
    let filtered = donors;

    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone.includes(searchTerm)
      );
    }

    setFilteredDonors(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [donors, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);
  const startIndex = (currentPage - 1) * donorsPerPage;
  const endIndex = startIndex + donorsPerPage;
  const currentDonors = filteredDonors.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (donor: Donor) => {
    setSelectedDonor(donor);
    setError('');
    setFormData({
      name: donor.name,
      phone: donor.phone
    });
    setIsModalOpen(true);
  };



  const handleView = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsViewModalOpen(true);
    loadLatestCertificate(donor);
  };

  const handleViewDonatedBooks = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsDonatedBooksModalOpen(true);
    loadDonatedBooks(donor);
  };

  const loadDonatedBooks = async (donor: Donor) => {
    try {
      setIsDonatedBooksLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_donors_management_web.php?action=getDonatedBooks&donorId=${donor.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setDonatedBooks(result.data);
      } else {
        setError(result.message || 'Failed to fetch donated books');
        setDonatedBooks([]);
      }
    } catch (error) {
      console.error('Load donated books error:', error);
      setError('Network error. Please try again.');
      setDonatedBooks([]);
    } finally {
      setIsDonatedBooksLoading(false);
    }
  };

  const loadLatestCertificate = async (donor: Donor) => {
    try {
      setIsCertificateLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_donors_management_web.php?action=getLatestCertificate&donorId=${donor.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDonationCertificate(result.data);
      } else {
        setDonationCertificate(null);
      }
    } catch (error) {
      console.error('Load certificate error:', error);
      setDonationCertificate(null);
    } finally {
      setIsCertificateLoading(false);
    }
  };

  const handleDelete = async (donorId: string) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        setError('');
        
        const response = await fetch(`${serverUrl}p_donors_management_web.php?action=delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donorId: donorId
          })
        });

        const result = await response.json();

        if (result.success) {
          // Remove from local state
          setDonors(donors.filter(donor => donor.id !== donorId));
        } else {
          setError(result.message || 'Failed to delete donor');
        }
      } catch (error) {
        console.error('Delete donor error:', error);
        setError('Network error. Please try again.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave({
      ...formData,
      email: selectedDonor?.email || '',
      address: selectedDonor?.address || '',
      totalDonations: selectedDonor?.totalDonations || 0,
      lastDonationDate: selectedDonor?.lastDonationDate || new Date().toISOString().split('T')[0],
      donatedBooks: selectedDonor?.donatedBooks || []
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (donorData: Omit<Donor, 'id'>) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (selectedDonor) {
        // Edit existing donor
        const response = await fetch(`${serverUrl}p_donors_management_web.php?action=update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedDonor.id,
            name: donorData.name,
            phone: donorData.phone
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update local state
          setDonors(donors.map(donor =>
            donor.id === selectedDonor.id
              ? result.data
              : donor
          ));
          setIsModalOpen(false);
        } else {
          setError(result.message || 'Failed to update donor');
        }
      }
    } catch (error) {
      console.error('Save donor error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner"></div>
        <p className="mt-2">Loading donors...</p>
      </div>
    );
  }

  return (
   <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Donor Management</h1>
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
            onClick={fetchDonors}
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
              placeholder="Search donors by name or phone..."
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

      {/* Donors Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Donations</th>
              <th>Last Donation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDonors.length > 0 ? (
              currentDonors.map((donor) => (
                <tr key={donor.id}>
                  <td><strong>{donor.name}</strong></td>
                  <td>{donor.phone}</td>
                  <td>
                    <span className="badge badge-info">
                      {donor.totalDonations} books
                    </span>
                  </td>
                  <td>{new Date(donor.lastDonationDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleView(donor)}
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDonatedBooks(donor)}
                        className="btn btn-success btn-sm"
                        title="View Donated Books"
                      >
                        <Gift size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(donor)}
                        className="btn btn-warning btn-sm"
                        title="Edit Donor"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(donor.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Donor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No donors found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredDonors.length > donorsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredDonors.length)} of {filteredDonors.length} donors
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="d-flex align-items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    minWidth: '2.5rem',
                    height: '2.5rem'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                Edit Donor Details
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
                  <label className="form-label">Phone Number</label>
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
                  {isSubmitting ? 'Updating...' : 'Update Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedDonor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Donor Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="card">
                <div className="d-flex align-items-start gap-3 mb-4">
                  <User size={48} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <h3 className="card-title">{selectedDonor.name}</h3>
                    <p className="card-subtitle">Donor ID: {selectedDonor.id}</p>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Phone:</strong> {selectedDonor.phone}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Gift size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Total Donations:</strong>
                    <span className="badge badge-success">
                      {selectedDonor.totalDonations} books
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Last Donation:</strong> {new Date(selectedDonor.lastDonationDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Latest Donation Certificate */}
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ 
                    color: 'var(--primary-color)', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FileText size={20} />
                    Latest Donation Certificate
                  </h4>
                  
                  {isCertificateLoading ? (
                    <div className="text-center p-3">
                      <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                      <p className="mt-2" style={{ fontSize: '0.9rem' }}>Loading certificate...</p>
                    </div>
                  ) : donationCertificate ? (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '1rem',
                      border: '2px dashed var(--primary-color)',
                      borderRadius: 'var(--border-radius-md)',
                      backgroundColor: 'var(--light-gray)'
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <Image size={24} style={{ color: 'var(--primary-color)' }} />
                        <p style={{ 
                          margin: '0.5rem 0', 
                          fontSize: '0.9rem', 
                          color: 'var(--dark-gray)' 
                        }}>
                          Certificate uploaded on {new Date(donationCertificate.f_createdat).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <img 
                        src={`${serverUrl}uploads/${donationCertificate.f_path}`}
                        alt="Donation Certificate"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-sm)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                      
                      <div style={{ 
                        display: 'none',
                        color: 'var(--danger-color)',
                        fontSize: '0.9rem',
                        marginTop: '1rem'
                      }}>
                        <FileText size={20} />
                        <p>Certificate image could not be loaded</p>
                      </div>
                      
                      <div style={{ marginTop: '1rem' }}>
                        <a 
                          href={`${serverUrl}uploads/${donationCertificate.f_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Eye size={16} />
                          View Full Size
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'var(--medium-gray)',
                      backgroundColor: 'var(--light-gray)',
                      borderRadius: 'var(--border-radius-md)'
                    }}>
                      <FileText size={32} style={{ color: 'var(--medium-gray)' }} />
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        No donation certificate available
                      </p>
                    </div>
                  )}
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

      {/* Donated Books Modal */}
      {isDonatedBooksModalOpen && selectedDonor && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                Books Donated by {selectedDonor.name}
              </h2>
              <button onClick={() => setIsDonatedBooksModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {isDonatedBooksLoading ? (
                <div className="text-center p-4">
                  <div className="spinner"></div>
                  <p className="mt-2">Loading donated books...</p>
                </div>
              ) : donatedBooks.length > 0 ? (
                <div>
                  <div className="mb-3 text-center">
                    <span className="badge badge-info" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      Total Donations: {donatedBooks.reduce((sum, book) => sum + book.count, 0)} books
                    </span>
                  </div>

                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Book Title</th>
                          <th>Author</th>
                          <th>Genre</th>
                          <th>Count</th>
                          <th>Donation Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donatedBooks.map((book) => (
                          <tr key={book.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <BookIcon size={16} style={{ color: 'var(--primary-color)' }} />
                                <strong>{book.title}</strong>
                              </div>
                            </td>
                            <td>{book.author}</td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <Tag size={14} />
                                {book.category}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-success">
                                {book.count} books
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <Calendar size={14} />
                                {new Date(book.donationDate).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3" style={{ backgroundColor: 'var(--light-gray)', borderRadius: 'var(--border-radius-md)' }}>
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                      Donation Summary
                    </h4>
                    <div className="text-center">
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {donatedBooks.reduce((sum, book) => sum + book.count, 0)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--dark-gray)' }}>Total Books Donated</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <BookIcon size={48} style={{ color: 'var(--medium-gray)' }} />
                  <p className="mt-3" style={{ color: 'var(--dark-gray)' }}>
                    No books donated by this donor yet.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsDonatedBooksModalOpen(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorList;
