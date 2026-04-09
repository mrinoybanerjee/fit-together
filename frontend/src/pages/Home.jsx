import { usePartnerData } from '../hooks/usePartnerData.js';
import Dashboard from '../components/Dashboard.jsx';

export default function Home() {
  const partnerData = usePartnerData();
  return <Dashboard {...partnerData} />;
}
