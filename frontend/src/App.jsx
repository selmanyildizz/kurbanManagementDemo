import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import QueuePage from './pages/QueuePage';
import RegisterPage from './pages/RegisterPage';
import CheckinPage from './pages/CheckinPage';
import CustomerLookupPage from './pages/CustomerLookupPage';
import LogPage from './pages/LogPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QueuePage />} />
          <Route path="kayit" element={<RegisterPage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="musteri" element={<CustomerLookupPage />} />
          <Route path="log" element={<LogPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
