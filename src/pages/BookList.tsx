import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../App';
import { Edit3, Trash2, Eye, Search, X, Save, Book as BookIcon, User, Calendar, Tag, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import serverUrl from './server';

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(10);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    count: 0,
    category: '',
    donorId: ''
  });

  // Fetch books from backend
  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${serverUrl}p_books_management_web.php?action=fetch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setBooks(result.data);
      } else {
        setError(result.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with real data
  useEffect(() => {
    fetchBooks();
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
    setCurrentPage(1); // Reset to first page when search changes
  }, [books, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

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

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      count: book.count,
      category: book.category,
      donorId: book.donorId
    });
    setIsModalOpen(true);
  };



  const handleView = (book: Book) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setError('');
        
        const response = await fetch(`${serverUrl}p_books_management_web.php?action=delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId: bookId
          })
        });

        const result = await response.json();

        if (result.success) {
          // Remove from local state
          setBooks(books.filter(book => book.id !== bookId));
        } else {
          setError(result.message || 'Failed to delete book');
        }
      } catch (error) {
        console.error('Delete book error:', error);
        setError('Network error. Please try again.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave({
      ...formData,
      destination: '',
      addedBy: 'Admin',
      addedDate: selectedBook?.addedDate || new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (bookData: Omit<Book, 'id'>) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (selectedBook) {
        // Edit existing book
        const response = await fetch(`${serverUrl}p_books_management_web.php?action=update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedBook.id,
            title: bookData.title,
            author: bookData.author,
            category: bookData.category,
            count: bookData.count
          })
        });

        const result = await response.json();

        if (result.success) {
          // Update local state
          setBooks(books.map(book =>
            book.id === selectedBook.id
              ? result.data
              : book
          ));
          setIsModalOpen(false);
        } else {
          setError(result.message || 'Failed to update book');
        }
      }
    } catch (error) {
      console.error('Save book error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner"></div>
        <p className="mt-2">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Book Management</h1>
        <button 
          onClick={() => navigate('/book-transfer')}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            padding: '0.75rem 1.5rem'
          }}
        >
          <ArrowRightLeft size={20} />
          Book Transfer
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
            onClick={fetchBooks}
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

      {/* Search and Filter */}
      <div className="card mb-4">
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <div className="form-group" style={{ flex: '1', minWidth: '100%' }}>
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
                  width: '100%',
                  height: '3rem',
                  fontSize: '1.1rem'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Count</th>
              <th>Category</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.length > 0 ? (
              currentBooks.map((book) => (
                <tr key={book.id}>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td>{book.count}</td>
                  <td>{book.category}</td>
                  <td>{new Date(book.addedDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleView(book)}
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(book)}
                        className="btn btn-warning btn-sm"
                        title="Edit Book"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No books found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredBooks.length > booksPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length} books
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
                Edit Book Details
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
                  <label className="form-label">Book Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter book genre/category"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Count</label>
                  <input
                    type="number"
                    name="count"
                    value={formData.count}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter book count"
                    min="0"
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
                  {isSubmitting ? 'Updating...' : 'Update Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Book Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="card">
                <div className="d-flex align-items-start gap-3 mb-4">
                  <BookIcon size={48} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <h3 className="card-title">{selectedBook.title}</h3>
                    <p className="card-subtitle">by {selectedBook.author}</p>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <Tag size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Count:</strong> {selectedBook.count}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Tag size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Category:</strong> {selectedBook.category}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Added Date:</strong> {new Date(selectedBook.addedDate).toLocaleDateString()}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <User size={18} style={{ color: 'var(--dark-gray)' }} />
                    <strong>Added By:</strong> {selectedBook.addedBy}
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

export default BookList;
