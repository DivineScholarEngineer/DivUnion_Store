import React from 'react';
import * as styles from './Policy.module.css';

const Policy = (props) => {
  return (
    <div className={styles.root}>
      <div className={styles.section}>
        <h3>1. How we handle your data</h3>
        <p>
          DevUnion Tech collects only the information you voluntarily provide
          when creating an account or checking out. We never resell data and we
          store as little as possible to operate the experience.
        </p>
        <p>
          This privacy summary explains how your details are collected, used,
          and stored when you use DevUnion Tech services. All validation and
          permission checks are enforced server-side in the production system.
        </p>
        <p>
          By using our services you agree to the rules and safeguards described
          here. We will keep this section updated as the platform evolves.
        </p>
      </div>

      <div className={styles.section}>
        <h3>2. Who can use DevUnion</h3>
        <p>
          Our storefront and account tools are intended for people over 18. If
          you are younger, a parent or guardian must manage the account and
          purchases on your behalf.
        </p>
        <p>
          Attempted sign-ups outside these rules will be rejected and removed to
          keep the database clean. We do not knowingly collect data from
          children.
        </p>
      </div>

      <div className={styles.section}>
        <h3>3. Responsible use</h3>
        <p>
          Help us keep DevUnion Tech secure by avoiding fraud, impersonation,
          and unauthorized data access. Accounts cannot self-assign admin
          privileges and any abuse is removed from the system.
        </p>
        <p>
          Respectful use keeps the experience safe for guests, users, minor
          admins, and the main admin.
        </p>
      </div>
    </div>
  );
};

export default Policy;
