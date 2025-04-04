import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ConcertPage from './pages/ConcertPage';
import './styles.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/concert/:id" element={<ConcertPage />} />
      </Routes>
    </Router>
  );
}

export default App;
