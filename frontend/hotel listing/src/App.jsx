import { Routes, Route } from 'react-router-dom';
import ListPage from './components/ListPage';
import HotelForm from './components/HotelForm';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/add" element={<HotelForm />} />
        <Route path="/edit/:id" element={<HotelForm />} />
        <Route path="/hotel/:id" element={<DetailPage />} />
      </Routes>
    </div>
  );
}

export default App;