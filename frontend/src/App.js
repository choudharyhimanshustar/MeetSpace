import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUP from "./components/SignUP";
import { SocketProvider } from "./Context/SocketProvider";
import { UserProvider, useUser } from "./UserProvider";
import Room from "./components/Room";
import Temp from "./components/Temp";

function App() {
  return (
    <UserProvider>
      <Main />
    </UserProvider>
  );
}

const Main = () => {
  const { user } = useUser(); // Get user state

  return (
    <SocketProvider user={user}>
      <Router className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/SignUP" element={<SignUP />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/temp" element={<Temp />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
