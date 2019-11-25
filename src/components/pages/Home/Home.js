import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import LeftContainer from '../Propose/Detail/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import LandingPage from '../../layout/LandingPage';
import PuNewLock from '../Propose/PuNewLock';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

const RightBoxMemories = styled.div`
  padding: 0 0 ${rem(45)} ${rem(45)};
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;
const ProposeWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  .proposeColumn {
    &--left {
      width: 30%;
    }
    &--right {
      width: 70%;
    }
  }
  @media (max-width: 768px) {
    display: block;
    .proposeColumn {
      width: 100%;
      &--left {
        display: none;
      }
    }
  }
`;
const RightBox = styled.div`
  text-align: center;
  padding: ${rem(30)};
  img {
    width: 200px;
    height: 200px;
  }
  h1,
  h2 {
    text-align: center;
  }
  .emptyTitle {
    margin: 16px auto;
    font-size: 25px;
    line-height: 32px;
    font-weight: 60px;
  }
  .emptySubTitle {
    color: #506175;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
`;

const ActionForm = styled.div`
  margin-top: 20px;
`;

const ShadowBox = styled.div`
  padding: ${rem(30)};
  border-radius: 10px;
  background: #f5f5f8;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  background: #fff;
  width: 100%;
  color: #737373;
  display: flex;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

const SupportSite = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
      text-decoration: underline;
    }
  }
  .footRight {
    margin-left: 15px;
  }
`;

function Home(props) {
  const [loading, setLoading] = useState(true);
  const [openPromise, setOpenPromise] = useState(false);
  const { setProposes, setMemory, address, history } = props;
  const [locks, setlocks] = useState(null);

  useEffect(() => {
    let cancel = false;
    fetchData(cancel);
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(cancel) {
    console.log(address);
    APIService.getLocksForFeed(address).then(resp => {
      console.log(resp);
      // set to redux
      setProposes(resp.locks);
      console.log(resp);
      if (cancel) return;
      setlocks(resp.locks.length > 0);
      // console.log(resp.locks);
      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return tmp.concat(lock.memoIndex);
      }, []);
      // console.log('memoIndex', memoIndex);
      memoIndex.length > 0 &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // set to redux
          setMemory(mems);
        });
      setLoading(false);
    });
  }
  function openPopup() {
    setOpenPromise(true);
  }

  function openExplore() {
    history.push('/explore');
  }

  function closePopup() {
    setOpenPromise(false);
    fetchData();
  }

  const renderHomeEmptyPropose = (
    <FlexWidthBox>
      <ShadowBox>
        <RightBox>
          <div>
            <img src="/static/img/plant.svg" alt="plant" />
            <div className="emptyTitle">
              <h1>You have no locks yet.</h1>
            </div>
            <div className="emptySubTitle">
              <h2>Locks are the way you connect and share memories with your loved ones.</h2>
            </div>
            <ActionForm>
              <ButtonPro variant="contained" color="primary" onClick={openPopup}>
                Create first lock
              </ButtonPro>
            </ActionForm>
            <LinkPro className="btn_add_promise" onClick={openExplore}>
              or explore others&apos;
            </LinkPro>
          </div>
        </RightBox>
      </ShadowBox>
      {openPromise && <PuNewLock close={closePopup} />}
    </FlexWidthBox>
  );

  return address ? (
    <>
      {locks !== null && (
        <>
          {locks ? (
            <ProposeWrapper>
              <div className="proposeColumn proposeColumn--left">
                <LeftContainer loading={loading} />
              </div>
              <div className="proposeColumn proposeColumn--right">
                <RightBoxMemories>
                  <MemoryContainer memorydata={[]} />
                </RightBoxMemories>
              </div>
            </ProposeWrapper>
          ) : (
            <FlexBox wrap="wrap" justify="center">
              {renderHomeEmptyPropose}
              <FooterWapper>
                <SupportSite>
                  <p>
                    &copy; 2019&nbsp;
                    <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                      Trada Technology
                    </a>
                  </p>
                </SupportSite>
                <SupportSite>
                  <div className="footRight">
                    <p>
                      Email:&nbsp;
                      <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
                        info@icetea.io
                      </a>
                    </p>
                  </div>
                  <div className="footRight">
                    <p>
                      Telegram:&nbsp;
                      <a href="https://t.me/iceteachain" target="_blank" rel="noopener noreferrer">
                        Icetea Vietnam
                      </a>
                    </p>
                  </div>
                </SupportSite>
              </FooterWapper>
            </FlexBox>
          )}
        </>
      )}
    </>
  ) : (
    <LandingPage />
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
