import React, { useState } from 'react';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  value: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ value }) => {
  const [activeSearchTab, setActiveSearchTab] = useState<string>("users");



  const users = [
    { id: 1, name: '@hello', type: 'Hello' },
    { id: 2, name: '@hello_2', type: 'hello_2' },
    { id: 3, name: '@helloWorld', type: 'God' },
    { id: 4, name: '@hello22', type: 'Александр' },
    { id: 5, name: '@helloYou', type: 'H E L L O' },
  ];

  const posts = [
    { id: 1, title: 'hello everyone! My name is ...', type: '@rebirth' },
    { id: 2, title: 'hello world!', type: '@randomtype93' },
  ];

  const shouldShowResults = value.toLowerCase() === 'hello';

  return (
    <div className={styles['search-modal']}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeSearchTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveSearchTab('users')}
        >
          Users
        </button>
        <button
          className={`${styles.tab} ${activeSearchTab === 'posts' ? styles.active : ''}`}
          onClick={() => setActiveSearchTab('posts')}
        >
          Posts
        </button>
      </div>

      <div className={styles['tab-content-wrapper']}>
        {shouldShowResults ? (
          <>
            <div
              className={`${styles['tab-content']} ${activeSearchTab === 'users' ? styles.active : ''}`}
              style={{ transform: `translateX(${activeSearchTab === 'users' ? 0 : -100}%)` }}
            >
              {users.map((item) => (
                <div className={styles['search-item']} key={item.id}>
                  <span className={styles['search-result']}>{item.name}</span>
                  <span className={styles['search-meta']}>{item.type}</span>
                </div>
              ))}
            </div>

            <div
              className={`${styles['tab-content']} ${activeSearchTab === 'posts' ? styles.active : ''}`}
              style={{ transform: `translateX(${activeSearchTab === 'posts' ? 0 : 100}%)` }}
            >
              {posts.map((item) => (
                <div className={styles['search-item']} key={item.id}>
                  <span className={styles['search-result']}>{item.title}</span>
                  <span className={styles['search-meta']}>{item.type}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles['no-results']}>
            <p>No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;


