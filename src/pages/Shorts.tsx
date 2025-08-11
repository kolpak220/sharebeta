import React from 'react';
import { Film } from 'lucide-react';
import styles from './Shorts.module.css';

const Shorts: React.FC = () => {
  return (
    <div className={styles.shortsPage}>
      <div className={styles.shortsBlank}>
        <Film size={48} />
        <h2>There will be shorts soon</h2>
        <p>We are working on it. Stay tuned!</p>
      </div>
    </div>
  );
};

export default Shorts;
