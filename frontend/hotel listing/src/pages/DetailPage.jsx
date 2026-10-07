import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/hotels/${id}`)
      .then(res => setHotel(res.data))
      .catch(err => console.error("Error fetching hotel detail:", err));
  }, [id]);

  if (!hotel) return <div style={{ padding: '60px', textAlign: 'center', fontSize: '1.1rem', color: '#666' }}>Loading full hotel details...</div>;

  const position = [parseFloat(hotel.latitude), parseFloat(hotel.longitude)];

  return (
    <>
      <nav className="navbar">
        <h1>JERRY Hotel Listings</h1>
      </nav>

      <div className="detail-container">
        <Helmet>
          <title>{hotel.title} - JERRY Hotel Listings</title>
          <meta name="description" content={hotel.description.substring(0, 150)} />
        </Helmet>
        
        <Link to="/" className="back-link">← Back to List</Link>
        
        <div className="detail-header-row">
          <h2 className="detail-title">{hotel.title}</h2>
          <div className="detail-price-badge">${hotel.price} <span style={{fontSize: '0.8rem', fontWeight: '400', opacity: '0.8'}}> / night</span></div>
        </div>
        
        <div className="detail-image-wrapper">
          <img 
            src={`http://localhost:5000/${hotel.image_path}`} 
            alt={`Full view of ${hotel.title}`} 
            className="detail-image"
          />
        </div>
        
        <div className="section-card">
          <h3>About this hotel</h3>
          <p className="detail-desc">{hotel.description}</p>
        </div>
        
        <div className="section-card">
          <h3>Location & Map</h3>
          <div className="map-wrapper">
            <MapContainer 
              center={position} 
              zoom={14} 
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              />
              <Marker position={position}>
                <Popup>{hotel.title}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPage;