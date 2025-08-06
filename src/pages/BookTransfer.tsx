import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../App';
import { Search, X, Save, ArrowLeft, ArrowRightLeft, MapPin, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import serverUrl from './server';

interface Transfer {
  t_id: number;
  tb_id: number;
  t_destination: string;
  tb_count: number;
  t_createdAt: string;
  t_updatedAt: string;
  book_title?: string;
  book_author?: string;
  book_category?: string;
}

const BookTransfer: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isTransfersLoading, setIsTransfersLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const transfersPerPage = 10;
  const booksPerPage = 10;
  
  const [transferForm, setTransferForm] = useState({
    bookId: '',
    count: 1,
    destination: ''
  });

  // Fetch books from backend
  const fetchBooks = async () => {
    try {
      setError('');
      console.log('Fetching books...');
      
      const response = await fetch(`${serverUrl}p_book_transfer_web.php?action=fetch_books`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('Books fetch result:', result);

      if (result.success) {
        setBooks(result.data);
        setFilteredBooks(result.data);
        console.log('Books updated successfully');
      } else {
        setError(result.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      setError('Network error. Please check your connection and try again.');
    }
  };

  // Fetch transfers from backend
  const fetchTransfers = async () => {
    try {
      setIsTransfersLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_book_transfer_web.php?action=fetch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setTransfers(result.data);
      } else {
        setError(result.message || 'Failed to fetch transfers');
      }
    } catch (error) {
      console.error('Fetch transfers error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsTransfersLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTransfers();
  }, []);

  // Filter books based on search
  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
    setCurrentBookPage(1); // Reset to first page when search changes
  }, [books, searchTerm]);

  // Calculate pagination for transfers
  const totalPages = Math.ceil(transfers.length / transfersPerPage);
  const startIndex = (currentPage - 1) * transfersPerPage;
  const endIndex = startIndex + transfersPerPage;
  const currentTransfers = transfers.slice(startIndex, endIndex);

  // Calculate pagination for books
  const totalBookPages = Math.ceil(filteredBooks.length / booksPerPage);
  const bookStartIndex = (currentBookPage - 1) * booksPerPage;
  const bookEndIndex = bookStartIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(bookStartIndex, bookEndIndex);

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

  const handleBookPageChange = (page: number) => {
    setCurrentBookPage(page);
  };

  const handlePrevBookPage = () => {
    if (currentBookPage > 1) {
      setCurrentBookPage(currentBookPage - 1);
    }
  };

  const handleNextBookPage = () => {
    if (currentBookPage < totalBookPages) {
      setCurrentBookPage(currentBookPage + 1);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setTransferForm({
      ...transferForm,
      bookId: book.id
    });
    setShowBookSelector(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook || !transferForm.destination.trim() || transferForm.count <= 0) {
      setError('Please select a book, enter destination, and specify count greater than 0');
      return;
    }

    if (transferForm.count > selectedBook.count) {
      setError(`Cannot transfer ${transferForm.count} books. Only ${selectedBook.count} available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`${serverUrl}p_book_transfer_web.php?action=add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: transferForm.bookId,
          count: parseInt(transferForm.count.toString()),
          destination: transferForm.destination.trim()
        })
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      console.log('Add transfer response:', result);

      if (result.success) {
        // Reset form
        setTransferForm({
          bookId: '',
          count: 1,
          destination: ''
        });
        setSelectedBook(null);
        
        // Refresh data
        console.log('Refreshing data after successful transfer...');
        await fetchTransfers();
        await fetchBooks();
        
        alert('Book transfer added successfully!');
      } else {
        setError(result.message || 'Failed to add transfer');
      }
    } catch (error) {
      console.error('Add transfer error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transferId: number) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        setError('');
        
        const response = await fetch(`${serverUrl}p_book_transfer_web.php?action=delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transferId: transferId
          })
        });

        const result = await response.json();

        if (result.success) {
          // Refresh data
          fetchTransfers();
          fetchBooks();
          alert('Transfer deleted successfully!');
        } else {
          setError(result.message || 'Failed to delete transfer');
        }
      } catch (error) {
        console.error('Delete transfer error:', error);
        setError('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => navigate('/books')}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
            Back to Books
          </button>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Book Transfer</h1>
        </div>
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
            onClick={() => setError('')}
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
            Dismiss
          </button>
        </div>
      )}

      {/* Transfer Form */}
      <div className="card mb-4">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowRightLeft size={24} style={{ color: 'var(--primary-color)' }} />
          Add New Transfer
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="d-flex flex-column gap-3">
            {/* Book Selection */}
            <div className="form-group">
              <label className="form-label">Select Book</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={selectedBook ? `${selectedBook.title} by ${selectedBook.author}` : ''}
                  placeholder="Click to select a book..."
                  className="form-input"
                  readOnly
                  onClick={() => setShowBookSelector(true)}
                  style={{ cursor: 'pointer' }}
                  required
                />
                {selectedBook && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--dark-gray)', 
                    marginTop: '0.25rem' 
                  }}>
                    Available: {selectedBook.count} books | Category: {selectedBook.category}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex gap-3">
              {/* Count */}
              <div className="form-group" style={{ flex: '1' }}>
                <label className="form-label">Count to Transfer</label>
                <input
                  type="number"
                  name="count"
                  value={transferForm.count}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Enter count"
                  min="1"
                  max={selectedBook?.count || 1}
                  required
                />
              </div>

              {/* Destination */}
              <div className="form-group" style={{ flex: '2' }}>
                <label className="form-label">Destination Address</label>
                <input
                  type="text"
                  name="destination"
                  value={transferForm.destination}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Enter destination address..."
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !selectedBook}
              style={{
                alignSelf: 'flex-start',
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'Adding Transfer...' : 'Add Transfer'}
            </button>
          </div>
        </form>
      </div>

      {/* Book Selector Modal */}
      {showBookSelector && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Select Book for Transfer</h2>
              <button onClick={() => setShowBookSelector(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Search */}
              <div className="form-group mb-3">
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
                    placeholder="Search books by title, author, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ 
                      paddingLeft: '3rem',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Books List */}
              <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Available</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBooks.length > 0 ? (
                      currentBooks.map((book) => (
                        <tr key={book.id}>
                          <td><strong>{book.title}</strong></td>
                          <td>{book.author}</td>
                          <td>{book.category}</td>
                          <td>
                            <span className={`badge ${book.count > 0 ? 'badge-success' : 'badge-danger'}`}>
                              {book.count} books
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleBookSelect(book)}
                              className="btn btn-primary btn-sm"
                              disabled={book.count <= 0}
                              style={{
                                opacity: book.count <= 0 ? 0.5 : 1,
                                cursor: book.count <= 0 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          No books found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Books Pagination */}
              {filteredBooks.length > booksPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
                      Showing {bookStartIndex + 1} to {Math.min(bookEndIndex, filteredBooks.length)} of {filteredBooks.length} books
                    </span>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={handlePrevBookPage}
                      disabled={currentBookPage === 1}
                      className="btn btn-secondary btn-sm"
                      style={{
                        opacity: currentBookPage === 1 ? 0.5 : 1,
                        cursor: currentBookPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    
                    <div className="d-flex align-items-center gap-1">
                      {Array.from({ length: totalBookPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleBookPageChange(page)}
                          className={`btn btn-sm ${page === currentBookPage ? 'btn-primary' : 'btn-secondary'}`}
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
                      onClick={handleNextBookPage}
                      disabled={currentBookPage === totalBookPages}
                      className="btn btn-secondary btn-sm"
                      style={{
                        opacity: currentBookPage === totalBookPages ? 0.5 : 1,
                        cursor: currentBookPage === totalBookPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowBookSelector(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfers Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} style={{ color: 'var(--primary-color)' }} />
          Transfer History
        </h3>

        {isTransfersLoading ? (
          <div className="text-center p-4">
            <div className="spinner"></div>
            <p className="mt-2">Loading transfers...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Destination</th>
                    <th>Transfer Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransfers.length > 0 ? (
                    currentTransfers.map((transfer) => (
                      <tr key={transfer.t_id}>
                        <td><strong>{transfer.book_title}</strong></td>
                        <td>{transfer.book_author}</td>
                        <td>{transfer.book_category}</td>
                        <td>
                          <span className="badge badge-info">
                            {transfer.tb_count} books
                          </span>
                        </td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            maxWidth: '200px'
                          }}>
                            <MapPin size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                            <span style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {transfer.t_destination}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            {new Date(transfer.t_createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(transfer.t_id)}
                            className="btn btn-danger btn-sm"
                            title="Delete Transfer"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-4">
                        No transfers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transfers.length > transfersPerPage && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
                    Showing {startIndex + 1} to {Math.min(endIndex, transfers.length)} of {transfers.length} transfers
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
          </>
        )}
      </div>
    </div>
  );
};

export default BookTransfer;
