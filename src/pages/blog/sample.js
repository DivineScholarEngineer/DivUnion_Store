import React from 'react';

import Layout from '../../components/Layout/Layout';
import Title from '../../components/Title';

import * as styles from './sample.module.css';

const SamplePage = () => {
  return (
    <Layout>
      <div className={styles.root}>
        <div className={styles.blankState}>
          <Title name={'DivUnion Journal'} subtitle={'Entries will appear once approved by admins.'} />
          <p className={styles.placeholder}>There is no published content yet.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SamplePage;
