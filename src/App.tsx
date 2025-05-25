import './App.css';
import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Homepage from './pages/HomePage.jsx';
import Concertpage from './pages/ConcertPage.jsx';
import Searchpage from './pages/SearchPage.jsx';
import Loginpage from './pages/LoginPage.jsx';
import Authpage from './pages/AuthPage.jsx';
import Ticketspage from './pages/TicketsPage.jsx'
import TicketTransferPage from './pages/TicketTransferPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import TicketReselling from './pages/TicketReselling.jsx';
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
        <Route path="/heldtickets" element={<Ticketspage />} />
        <Route path="/transfer" element={<TicketTransferPage />} />
        <Route path="/transfer/:orderId/:ticketId" element={<TicketDetailPage />} />
        <Route path="/reselling" element={<TicketReselling />} />
      </Routes>
      {/* Toasts container */}
      <ToastContainer
        position="top-right"
        autoClose={3000} //  duración del toast
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" //  colores más lindos
      />
    </Router>
  );
}

export default App;
