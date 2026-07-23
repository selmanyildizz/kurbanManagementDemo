import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const Icon = type === 'error' ? XCircle : CheckCircle2;

  return (
    <div className={`toast ${type === 'error' ? 'error' : 'ok'}`}>
      <Icon size={16} aria-hidden="true" /> {msg}
    </div>
  );
}
