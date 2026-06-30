import React from 'react';
import CryptoWidget from './components/widgets/CryptoWidget';
import FXWidget from './components/widgets/FXWidget';
import MacroWidget from './components/widgets/MacroWidget';
import HackerNewsWidget from './components/widgets/HackerNewsWidget';
import AirQualityWidget from './components/widgets/AirQualityWidget';
import HRWidget from './components/widgets/HRWidget';
import WeatherWidget from './components/widgets/WeatherWidget';
import TimeWidget from './components/widgets/TimeWidget';
import CalendarWidget from './components/widgets/CalendarWidget';

function App() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Operations Dashboard</h1>
        <p>Founder's Office · SOP Monitoring · Live Data</p>
      </div>

      <div className="widgets-grid">
        <TimeWidget />
        <WeatherWidget />
        <CryptoWidget />
        <FXWidget />
        <MacroWidget />
        <AirQualityWidget />
        <HRWidget />
        <CalendarWidget />
        <HackerNewsWidget />
      </div>
    </div>
  );
}

export default App;