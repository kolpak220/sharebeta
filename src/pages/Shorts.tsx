import React from 'react';
import { Film } from 'lucide-react';
import './Shorts.css';

const Shorts: React.FC = () => {
  return (
    <div className="shorts-page">
      <div className="shorts-blank">
        <Film size={48} />
        <h2>There will be shorts soon</h2>
        <p>We are working on it. Stay tuned!</p>
      </div>
    </div>
  );
};

export default Shorts;
