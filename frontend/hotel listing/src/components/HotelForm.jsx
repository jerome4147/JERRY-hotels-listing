import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createHotel, updateHotel } from '../store/hotelSlice';
import axios from 'axios';

const HotelForm = () => {
  const { id } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '', description: '', latitude: '', longitude: '', price: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/hotels/${id}`).then(res => {
        const h = res.data;
        setFormData({
          title: h.title, description: h.description,
          latitude: h.latitude, longitude: h.longitude, price: h.price
        });
        setImagePreview(`http://localhost:5000/${h.image_path}`);
      }).catch(err => console.error("Error fetching hotel:", err));
    }
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('price', formData.price);
    if (image) data.append('image', image);

    if (id) {
      await dispatch(updateHotel({ id, formData: data }));
    } else {
      await dispatch(createHotel(data));
    }
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <h1>JERRY Hotel Listings</h1>
      </nav>

      <div className="form-container">
        <Link to="/" className="back-link">← Cancel</Link>
        <h2>{id ? 'Edit Hotel Details' : 'Add New Hotel'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hotel Title</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="4" className="form-control" value={formData.description} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Latitude</label>
            <input type="number" step="any" name="latitude" className="form-control" value={formData.latitude} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Longitude</label>
            <input type="number" step="any" name="longitude" className="form-control" value={formData.longitude} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Price($)</label>
            <input type="number" min="0" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Upload Image</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} required={!id} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {id ? 'Update Hotel' : 'Save Hotel'}
          </button>
        </form>
      </div>
    </>
  );
};

export default HotelForm;