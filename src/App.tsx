import './App.css'
import './styles.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Homepage from './pages/HomePage.jsx'
import Concertpage from './pages/ConcertPage.jsx'
import Searchpage from './pages/SearchPage.jsx'
import Loginpage from './pages/LoginPage.jsx'
import Authpage from './pages/AuthPage.jsx'

function App() {

  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}
        ></Route>
        <Route path="/concert/:id" element={<Concertpage></Concertpage>}></Route>
        <Route path="/search/:query" element={<Searchpage></Searchpage>}></Route>
        <Route path="/login" element={<Loginpage></Loginpage>}></Route>
        <Route path="/auth" element={<Authpage></Authpage>}></Route>
      </Routes>
    </Router>)
}

export default App
