import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home';
import Login from './components/Login'
import SignUP from './components/SignUP';
import { SocketProvider } from './Context/SocketProvider';
import Room from './components/Room'
import Temp from './components/Temp';
function App() {
  return (
    <SocketProvider>
      <Router className="App">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/SignUP' element={<SignUP />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/temp" element={<Temp />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
