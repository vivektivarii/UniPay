import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar1';
import { Home } from './pages/Home';
import { Transaction } from './pages/Transaction';
import { History } from './pages/History';
import { Fees } from './pages/Fees';
import { Notification } from './pages/Notification';
import { Signin } from './pages/Signin';
import { Signup } from './pages/signup';
import { Profile } from './pages/Profile';


function MainLayout() {
  const location = useLocation();
  
  // Check if the current route is either /signin or /signup
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <div className="flex">
      {/* Conditionally render Sidebar and main layout only if not on /signin or /signup */}
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 bg-gray-50 min-h-screen ${isAuthPage ? "" : "p-4"}`}>
        <Routes>
          {/* Signin and Signup Routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
         

          {/* Other Routes with Sidebar */}
          <Route path="/home" element={<Home />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/history" element={<History />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/notification" element={<Notification />} />
          <Route path='/profile' element={<Profile />} />
          
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;