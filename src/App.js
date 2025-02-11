// App.js
import React, { useState } from 'react';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      <div className="auth-switch">
        <button onClick={() => setIsLogin(true)}>Login</button>
        <button onClick={() => setIsLogin(false)}>Signup</button>
      </div>

      {isLogin ? <Login /> : <Signup />}
    </div>
  );
}

export default App;
