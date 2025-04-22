import './App.css'
import './styles.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Homepage from './pages/HomePage.jsx'
import Concertpage from './pages/ConcertPage.jsx'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}
        ></Route>
        <Route path="/concert/:id" element={<Concertpage></Concertpage>}></Route>
      </Routes>
    </Router>)
}

export default App
