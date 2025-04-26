import './App.css';
import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Homepage from './pages/HomePage.jsx';
import Concertpage from './pages/ConcertPage.jsx';
import Searchpage from './pages/SearchPage.jsx';
import Loginpage from './pages/LoginPage.jsx';
import Authpage from './pages/AuthPage.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/concert/:id" element={<Concertpage />} />
        <Route path="/search/:query" element={<Searchpage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/auth" element={<Authpage />} />
      </Routes>
      {/* Agregar el ToastContainer para mostrar los toasts */}
      <ToastContainer />
    </Router>
  );
}

export default App;
