import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { ensureContract } from '../../../service/tweb3';
import { rem } from '../../elements/StyledUtils';
import { callView, showSubscriptionError } from '../../../helper';
import Icon from '../../elements/Icon';

import { LinkPro } from '../../elements/Button';
import { Lock } from '../../elements';
import PuConfirmLock from '../../elements/PuConfirmLock';
import PuNotifyLock from '../../elements/PuNotifyLock';
import * as actions from '../../../store/actions';

const LeftBox = styled.div`
  position: sticky;
  top: 5px;
  width: 100%;
  min-height: ${rem(360)};
  margin-bottom: ${rem(100)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    border-radius: 23px;
    font-weight: 600;
    font-size: ${rem(14)};
    color: #8250c8;
    border: 1px solid #8250c8;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
  }
  .title {
    color: #141927;
    font-weight: 600;
    font-size: ${rem(14)};
    text-transform: uppercase;
    /* margin-bottom: ${rem(20)}; */
  }
  @media (max-width: 768px) {
    min-height: auto;
    margin-bottom: ${rem(20)};
  }
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
  @media (max-width: 768px) {
    border-radius: 4px;
  }
`;

const CollectionBox = styled.div`
  padding-top: 1rem;
  width: 100%;
  display: block;
  .colName {
    color: #5a5e67;
    margin-right: ${rem(7)};
    font-size: ${rem(12)};
    cursor: pointer;
    margin-bottom: ${rem(9)};
    padding: 3px 12px 3px 6px;
    :hover {
      color: #8250c8;
      text-decoration: underline;
    }
    .material-icons {
      vertical-align: middle;
    }
    /* .colText {
    } */
  }
`;

const SupportSite = styled.div`
  position: absolute;
  display: block;
  padding-top: 1rem;
  line-height: 18px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  width: auto;
  color: #90949c;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
      text-decoration: underline;
    }
  }
  @media (max-width: 768px) {
    padding-left: 2rem;
  }
`;

function LeftContainer(props) {
  const {
    locks,
    setLocks,
    setNewLock,
    confirmLock,
    topInfo,
    proIndex,
    address,
    history,
    loading,
    isGuest,
    closeMobileMenu,
  } = props;

  const showCollection = proIndex != null
  const collections = showCollection && topInfo && topInfo.index === proIndex ? topInfo.collections || [] : [];

  const [index, setIndex] = useState(-1);
  const [step, setStep] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const signal = {};
    let sub
    ensureContract().then(c => {
      sub = watchCreatePropose(c, signal)
    })

    return () => {
      signal.cancel = true
      if (sub && sub.unsubscribe) {
        sub.unsubscribe()
        sub = undefined
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function watchCreatePropose(contract, signal) {
    const filter = {};
    return contract.events.allEvents(filter, async (error, result) => {
      if (signal && signal.cancel) return

      if (error) {
        showSubscriptionError(error, enqueueSnackbar);
      } else {
        const repsNew = result.filter(({ eventName }) => {
          return eventName === 'createLock';
        });

        if (
          repsNew.length > 0 &&
          (repsNew[0].eventData.log.sender === address || repsNew[0].eventData.log.receiver === address)
        ) {
          eventCreatePropose(repsNew[0].eventData, signal);
        }

        const respConfirm = result.filter(({ eventName }) => {
          return eventName === 'confirmLock';
        });
        if (
          respConfirm.length > 0 &&
          (respConfirm[0].eventData.log.sender === address || respConfirm[0].eventData.log.receiver === address)
        ) {
          eventConfirmLock(respConfirm[0].eventData);
        }
      }
    });
  }

  function closePopup() {
    setStep('');
    setNewLock(false);
  }

  function nextToAccept() {
    setStep('accept');
  }

  function nextToDeny() {
    setStep('deny');
  }

  function selectAccepted(lockIndex, collectionId) {
    let url = `/lock/${lockIndex}`;
    if (collectionId != null) {
      url += `/collection/${collectionId}`;
    }
    history.push(url);
    window.scrollTo(0, 0);
    if (closeMobileMenu) closeMobileMenu();
  }

  function newLock() {
    setNewLock(true);
    if (closeMobileMenu) closeMobileMenu();
  }

  function selectPending(lockIndex) {
    setStep('pending');
    setIndex(lockIndex);
  }

  function eventConfirmLock(data) {
    confirmLock(data.log);
    if (address === data.log.sender && data.log.status === 1) {
      const message = 'Your lock request has been accepted.';
      enqueueSnackbar(message, { variant: 'info' });
    }
  }

  async function eventCreatePropose(data) {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    setLocks(lockForFeed.locks);

    // console.log(data);
    if (address !== data.log.sender) {
      const message = 'You have a new lock.';
      enqueueSnackbar(message, { variant: 'info' });
    }
    // goto propose detail when sent to bot.
    if (data.log.receiver === process.env.REACT_APP_BOT_LOVER) {
      history.push(`/lock/${data.log.id}`);
    }
  }

  function renderCollections(_collections) {
    const cols = [{ name: 'All', description: 'All memories.' }].concat(_collections);
    return cols.map((item, index) => {
      return (
        <div className="colName" key={index} onClick={() => selectAccepted(proIndex, item.id)}>
          <Icon type="collections" />
          <span className="colText" title={item.description}>
            {item.name}
          </span>
        </div>
      );
    });
  }

  function renderOwnerLocks(locks, myAddress) {
    const newLocks = locks.filter(lock => {
      return lock.isMyLock;
    });
    const hasPending = Boolean(newLocks.find(l => l.status === 0))
    return (
      <>
        <div className="title">{!isGuest ? 'My lock' : 'Public lock'} </div>
        <div>
          <Lock loading={loading} locksData={newLocks} address={myAddress} flag={1} handlerSelect={selectAccepted} />
        </div>
        {!isGuest && hasPending && (
          <>
            <div className="title">Pending lock</div>
            <div>
              <Lock loading={loading} locksData={newLocks} address={myAddress} flag={0} handlerSelect={selectPending} />
            </div>
          </>
        )}
      </>
    );
  }
  function renderFollowingLocks(locks, myAddress) {
    const newLocks = locks.filter(lock => {
      return !lock.isMyLock;
    });
    return (
      <>
        <div className="title">Following lock</div>
        <div>
          <Lock loading={loading} locksData={newLocks} address={myAddress} flag={1} handlerSelect={selectAccepted} />
        </div>
      </>
    );
  }
  return (
    <>
      <LeftBox>
        <ShadowBox>
          {address && (
            <LinkPro className="btn_add_promise" onClick={newLock}>
              <Icon type="add" />
              New Lock
            </LinkPro>
          )}
          {renderOwnerLocks(locks, address)}
          {!isGuest && renderFollowingLocks(locks, address)}
          {showCollection && <div className="title">Collection</div>}
          {showCollection && <CollectionBox>{renderCollections(collections)}</CollectionBox>}
        </ShadowBox>
        <SupportSite>
          <p>
            <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
              Email
            </a>
            &nbsp;ー&nbsp;
            <a href="https://t.me/iceteachainvn" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
          </p>
          <p>
            Powered by&nbsp;
            <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
              Icetea Platform
            </a>
          </p>
        </SupportSite>
      </LeftBox>
      {step === 'pending' && (
        <PuNotifyLock
          index={index}
          locks={locks}
          address={address}
          close={closePopup}
          accept={nextToAccept}
          deny={nextToDeny}
        />
      )}
      {step === 'accept' && <PuConfirmLock close={closePopup} index={index} />}
      {step === 'deny' && <PuConfirmLock isDeny close={closePopup} index={index} />}
    </>
  );
}

const mapStateToProps = state => {
  return {
    locks: state.loveinfo.locks,
    address: state.account.address,
    topInfo: state.loveinfo.topInfo,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLocks: value => {
      dispatch(actions.setLocks(value));
    },
    setNewLock: value => {
      dispatch(actions.setNewLock(value));
    },
    confirmLock: value => {
      dispatch(actions.confirmLock(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeftContainer)
);
