import React from 'react';

import Layout from '../../components/Layout/Layout';
import Title from '../../components/Title';

import * as styles from './sample.module.css';

const SamplePage = () => {
  return (
    <Layout>
      <div className={styles.root}>
        <div className={styles.blankState}>
          <Title name={'DevUnion Journal'} />
        </div>
      </div>
    </Layout>
  );
};

export default SamplePage;
