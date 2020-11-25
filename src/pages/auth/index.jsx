import React, { useState } from 'react';
import { Alert, Tabs, message } from 'antd';
import ProForm from '@ant-design/pro-form';
import { history } from 'umi';
import axios from 'axios';

import styles from './index.less';
import SignUp from '../../components/Auth/Signup';
import LogIn from '../../components/Auth/Login';

const URL =
  process.env.NODE_ENV === 'development'
    ? process.env.AUDITME_DEV_BE_URL
    : process.env.AUDITME_PROD_BE_URL;

const AuthMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content || 'Unknown error'}
    type="error"
    showIcon
  />
);

const Auth = () => {
  const [response, setResponse] = useState({
    loading: false,
    success: null,
    data: null,
  });
  const [tab, setTab] = useState('login');

  const handleSubmit = (values) => {
    setResponse({
      ...response,
      loading: true,
    });

    const userType = 'user';

    if (tab === 'login') {
      axios
        .post(`${URL}/api/auth/${userType}/login`, {
          email: values.email,
          password: values.password,
        })
        .then((res) => {
          if (res.data.success) {
            localStorage.setItem('userType', userType);
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Login successfull');

            if (userType === 'user') history.push('/user/');

            if (userType === 'admin') history.push('/admin/');
          }
        })
        .catch((err) => {
          setResponse({
            loading: false,
            success: false,
            error: err.response?.data?.message,
          });
        });
    }

    if (tab === 'signup') {
      axios
        .post(`${URL}/api/auth/${userType}/signup`, {
          name: values.name,
          email: values.email,
          password: values.password,
        })
        .then((res) => {
          if (res.data.success) {
            localStorage.setItem('userType', userType);
            message.success('SignUp successfull');
            setResponse({
              ...response,
              loading: false,
            });
            setTab('login');
          }
        })
        .catch((err) => {
          setResponse({
            loading: false,
            success: false,
            error: err.response?.data?.message,
          });
        });
    }
  };

  return (
    <div className={styles.main}>
      <ProForm
        initialValues={{
          // userType: localStorage.getItem('userType') ? localStorage.getItem('userType') : null,
          userType: 'user',
        }}
        submitter={{
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: response.loading,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={async (values) => {
          handleSubmit(values);
        }}
      >
        <Tabs activeKey={tab} onChange={setTab}>
          <Tabs.TabPane key="login" tab="Login" />
          <Tabs.TabPane key="signup" tab="Signup" />
        </Tabs>

        {response.success === false && tab === 'login' && !response.loading && (
          <AuthMessage content={response.error} />
        )}
        {tab === 'login' && <LogIn styles={styles} />}

        {response.success === false && tab === 'signup' && !response.loading && (
          <AuthMessage content={response.error} />
        )}
        {tab === 'signup' && <SignUp styles={styles} />}
      </ProForm>
    </div>
  );
};

export default Auth;
