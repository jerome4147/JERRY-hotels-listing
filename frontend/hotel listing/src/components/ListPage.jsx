import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels, deleteHotel } from '../store/hotelSlice';
import { Link, useNavigate } from 'react-router-dom';

const ListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector((state) => state.hotels);

  const [filters, setFilters] = useState({ title: '', minPrice: '', maxPrice: '' });
  const [page, setPage] = useState(0);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchHotels({ ...filters, offset: page * limit, limit }));
  }, [dispatch, filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      dispatch(deleteHotel(id)).then(() => alert('Hotel deleted successfully!'));
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar">
        <h1>JERRY Hotel Listings</h1>
      </nav>

      <div className="layout-container">
        
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Search by Title</label>
            <input type="text" name="title" className="form-control" value={filters.title} onChange={handleFilterChange} placeholder="e.g. Grand Resort" />
          </div>
          
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input type="number" name="minPrice" className="form-control" placeholder="Min $" value={filters.minPrice} onChange={handleFilterChange} />
              <input type="number" name="maxPrice" className="form-control" placeholder="Max $" value={filters.maxPrice} onChange={handleFilterChange} />
            </div>
          </div>

          <Link to="/add" style={{ textDecoration: 'none' }}>
            <button className="btn btn-success">+ Add New Hotel</button>
          </Link>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="header-row">
            <h2>{items.length} Hotels Found</h2>
          </div>
          
          {status === 'loading' && <p>Loading hotels...</p>}
          
          <div className="hotel-list">
            {items.map((hotel) => (
              <div key={hotel.id} className="hotel-card">
                
                <img 
                  src={`http://localhost:5000/${hotel.image_path}`} 
                  alt={hotel.title} 
                  className="hotel-image"
                />
                
                <div className="hotel-details">
                  <span className="hotel-title" onClick={() => navigate(`/hotel/${hotel.id}`)}>
                    {hotel.title}
                  </span>
                  <span className="hotel-price">${hotel.price}</span>
                  <p className="hotel-desc">
                    {hotel.description.length > 150 ? hotel.description.substring(0, 150) + '...' : hotel.description}
                  </p>
                </div>
                
                <div className="action-buttons">
                  <button onClick={() => navigate(`/edit/${hotel.id}`)} className="btn btn-primary">Edit</button>
                  <button onClick={() => handleDelete(hotel.id)} className="btn btn-danger">Delete</button>
                </div>
              </div>
            ))}
            {items.length === 0 && status !== 'loading' && <p>No hotels found matching your filters.</p>}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn btn-outline" disabled={items.length < limit} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ListPage;