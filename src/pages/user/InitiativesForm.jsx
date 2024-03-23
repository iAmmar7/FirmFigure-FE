import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Alert, Card, message } from 'antd';
import { useEffect, useState } from 'react';
import { history } from 'umi';

import { useAppContext } from '@/contexts/AppContext';
import { getUserByRole, raiseInitiative } from '@/services/user';
import InitiativeForm from '../../components/Initiatives/InitiativeForm';

const URL = process.env.SERVER_URL;

const InitiativesForm = () => {
  const [loading, setLoading] = useState(false);
  const [evidenceBeforeFileList, setEvidenceBeforeFileList] = useState([]);
  const [evidenceAfterFileList, setEvidenceAfterFileList] = useState([]);
  const [managers, setManagers] = useState({ am: [], rm: [] });
  const { user } = useAppContext();

  useEffect(() => {
    const fetch = async () => {
      const [areaManagers, regManagers] = await Promise.all([
        getUserByRole('am'),
        getUserByRole('rm'),
      ]);
      setManagers({
        am: areaManagers.data.users,
        rm: regManagers.data.users,
      });
    };
    fetch();
  }, []);

  const submitForm = async (values) => {
    setLoading(true);

    raiseInitiative(values, { evidenceBeforeFileList, evidenceAfterFileList })
      .then((res) => {
        setLoading(false);
        if (res.data.success) {
          message.success('Initiative has been successfully published!');
          history.push('/user/reports/initiative-reports');
        }
      })
      .catch(() => {
        setLoading(false);
        message.error('Unable to publish initiative!', 10);
      });
  };

  const alertMessage = () => {
    const roleMessages = {
      rm:
        'You have signed up as regional manager, you can not submit an initiative. Please signup as auditor or station manager in order to submit an initiative.',
      am:
        'You have signed up as area manager, you can not submit an initiative. Please signup as auditor or station manager in order to submit an initiative.',
      viewer:
        'You have signed up as viewer, you can not submit an initiative. Please signup as auditor or station manager in order to submit an initiative.',
    };

    let messageText = roleMessages[user.role];

    return (
      messageText && (
        <Alert
          style={{
            marginBottom: 24,
          }}
          message={messageText}
          type="error"
          showIcon
        />
      )
    );
  };

  return (
    <PageHeaderWrapper content="Enter initiative details here by completing the form below">
      {alertMessage()}
      <Card>
        <InitiativeForm
          loading={loading}
          submitForm={submitForm}
          evidenceBeforeFileList={evidenceBeforeFileList}
          setEvidenceBeforeFileList={setEvidenceBeforeFileList}
          evidenceAfterFileList={evidenceAfterFileList}
          setEvidenceAfterFileList={setEvidenceAfterFileList}
          managers={managers}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default InitiativesForm;