import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import ProfileCard from './components/ProfileCard';
import Layout from './components/Layout';

function App() {
  return (
    <Router basename="/ritcard-by-lenn">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hero />} />
          <Route path="profile/:username" element={<ProfileCard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;