import React from 'react';

import Layout from '../../components/Layout/Layout';
import Title from '../../components/Title';

import * as styles from './index.module.css';

const BlogPage = () => {
  return (
    <Layout disablePaddingBottom>
      <div className={styles.root}>
        <div className={styles.blankState}>
          <Title
            name={'DevUnion Journal'}
            subtitle={'This space is reserved for future admin-approved entries.'}
          />
          <p className={styles.placeholder}>No journal entries are available yet.</p>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
