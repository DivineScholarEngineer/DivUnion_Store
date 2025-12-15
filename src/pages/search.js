import React from 'react';
import { parse } from 'query-string';

import Breadcrumbs from '../components/Breadcrumbs';
import Layout from '../components/Layout/Layout';
import Container from '../components/Container/Container';
import ProductCardGrid from '../components/ProductCardGrid';

import { generateMockProductData } from '../helpers/mock';
import productJson from '../helpers/product.json';

import * as styles from './search.module.css';

const SearchPage = (props) => {
  const params = parse(props.location.search);
  const searchQuery = params.q ? params.q : '';
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const results = normalizedQuery
    ? productJson.filter((item) => {
        const haystack = `${item.name} ${item.alt || ''} ${item.vendor || ''} ${
          item.tags?.join(' ') || ''
        }`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : [];

  const resultsCount = results.length;
  const hasQuery = normalizedQuery.length > 0;
  const recommended = generateMockProductData(3, 'featured');
  const gridData = resultsCount > 0 ? results : recommended;

  return (
    <Layout>
      <div className={styles.root}>
        <Container size={'large'} spacing={'min'}>
          <Breadcrumbs
            crumbs={[
              { link: '/', label: 'Home' },
              { label: hasQuery ? `Search results for '${searchQuery}'` : 'Search' },
            ]}
          />
          <div className={styles.searchLabels}>
            <h4>
              {hasQuery
                ? `Search results for '${searchQuery}'`
                : 'Start typing to search the catalog'}
            </h4>
            <span>
              {hasQuery
                ? `${resultsCount} result${resultsCount === 1 ? '' : 's'}`
                : 'Recommended essentials'}
            </span>
          </div>
          {hasQuery && resultsCount === 0 && (
            <p className={styles.noResults}>No matches yet — here are a few signals we think you will like.</p>
          )}
          {!hasQuery && (
            <p className={styles.noResults}>Use the search bar in the header to find a product or tag.</p>
          )}
          <ProductCardGrid
            showSlider={false}
            height={580}
            columns={3}
            data={gridData}
          />
        </Container>
      </div>
    </Layout>
  );
};

export default SearchPage;
