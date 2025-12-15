import React, { useEffect, useState } from 'react';
import { navigate } from 'gatsby';
import * as styles from './address.module.css';

import AccountLayout from '../../components/AccountLayout';
import AddressCard from '../../components/AddressCard';
import AddressForm from '../../components/AddressForm';
import Breadcrumbs from '../../components/Breadcrumbs';
import Icon from '../../components/Icons/Icon';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal';

import { isAuth } from '../../helpers/general';
import Button from '../../components/Button';

const ADDRESS_STORAGE_KEY = 'addresses';

const AddressPage = () => {
  const [isReady, setIsReady] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (isAuth() === false) {
      navigate('/login');
      return;
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady === true && typeof window !== 'undefined') {
      const storedAddresses = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (storedAddresses) {
        setAddressList(JSON.parse(storedAddresses));
      }
    }
  }, [isReady]);

  useEffect(() => {
    if (isReady === true && typeof window !== 'undefined') {
      window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addressList));
    }
  }, [addressList, isReady]);

  const closeForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleSaveAddress = (address) => {
    setAddressList((prev) => {
      if (editingIndex !== null) {
        const nextAddresses = [...prev];
        nextAddresses[editingIndex] = { ...nextAddresses[editingIndex], ...address };
        return nextAddresses;
      }

      return [...prev, { ...address, id: Date.now().toString() }];
    });
  };

  const handleDelete = () => {
    if (selectedIndex !== null) {
      setAddressList((prev) => prev.filter((_, index) => index !== selectedIndex));
    }
    setShowDelete(false);
    setSelectedIndex(null);
  };

  if (!isReady) return null;

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/address', label: 'Addresses' },
          ]}
        />
        <h1>Addresses</h1>

        {showForm === false && (
          <div className={styles.addressListContainer}>
            {addressList.length === 0 && (
              <p className={styles.emptyState}>
                No saved locations yet. Add only what you need and we&apos;ll keep it here until you delete it.
              </p>
            )}
            {addressList.map((address, index) => {
              return (
                <AddressCard
                  key={address.id || `${address.name}-${index}`}
                  showForm={() => {
                    setEditingIndex(index);
                    setShowForm(true);
                  }}
                  showDeleteForm={() => {
                    setSelectedIndex(index);
                    setShowDelete(true);
                  }}
                  {...address}
                />
              );
            })}
            <div
              className={styles.addCard}
              role={'presentation'}
              onClick={() => {
                setEditingIndex(null);
                setShowForm(true);
              }}
            >
              <Icon symbol={'plus'}></Icon>
              <span>new address</span>
            </div>
          </div>
        )}

        {showForm === true && (
          <AddressForm
            closeForm={closeForm}
            onSave={handleSaveAddress}
            initialAddress={editingIndex !== null ? addressList[editingIndex] : null}
          />
        )}
      </AccountLayout>
      <Modal visible={showDelete} close={() => setShowDelete(false)}>
        <div className={styles.confirmDeleteContainer}>
          <h4>Delete Address?</h4>
          <p>
            Are you sure you want to delete this address? You cannot undo this action once you press <strong>
              'Delete'
            </strong>
          </p>
          <div className={styles.actionContainer}>
            <Button onClick={handleDelete} level={'primary'}>
              Delete
            </Button>
            <Button onClick={() => setShowDelete(false)} level={'secondary'}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AddressPage;
