import React, { useEffect, useState } from 'react';
import { Link, navigate } from 'gatsby';
import * as styles from './orders.module.css';

import AccountLayout from '../../components/AccountLayout/AccountLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import Layout from '../../components/Layout/Layout';
import OrderItem from '../../components/OrderItem/OrderItem';
import { isAuth } from '../../helpers/general';
import Title from '../../components/Title';
import ProductCardGrid from '../../components/ProductCardGrid';
import { generateMockProductData } from '../../helpers/mock';

const ORDER_STORAGE_KEY = 'orders';

const OrderPage = () => {
  const [isReady, setIsReady] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isAuth() === false) {
      navigate('/login');
      return;
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady === true && typeof window !== 'undefined') {
      const storedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    }
  }, [isReady]);

  useEffect(() => {
    if (isReady === true && typeof window !== 'undefined') {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders, isReady]);

  const removeOrder = (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const recommended = generateMockProductData(3, 'featured');

  if (!isReady) return null;

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/orders/', label: 'Orders' },
          ]}
        />
        <h1>Orders</h1>

        {orders.length > 0 && (
          <div className={`${styles.tableHeaderContainer} ${styles.gridStyle}`}>
            <span className={styles.tableHeader}>Order #</span>
            <span className={styles.tableHeader}>Order Placed</span>
            <span className={styles.tableHeader}>Last Update</span>
            <span className={styles.tableHeader}>Status</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>You&apos;re all clear</h3>
            <p>
              Stay logged in and browse whenever you&apos;re ready. We&apos;ll keep this space blank until you place your first
              order.
            </p>
            <div className={styles.emptyActions}>
              <Link className={styles.shopLink} to={'/shop'}>
                Browse gear
              </Link>
            </div>
            <div className={styles.recommendations}>
              <Title name={'Recommended builds'} subtitle={'Signal-driven picks to get started'} />
              <ProductCardGrid showSlider={false} columns={3} height={420} data={recommended} />
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderItem key={order.id} order={order} headerStyling={styles.gridStyle} onDelete={() => removeOrder(order.id)} />
          ))
        )}
      </AccountLayout>
    </Layout>
  );
};

export default OrderPage;
