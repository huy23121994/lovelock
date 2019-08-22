import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { rem, FlexBox } from '../elements/Common';
import Icon from '../elements/Icon';
import TextField from '@material-ui/core/TextField';
// import { callView, getAccountInfo, getTagsInfo, getAlias } from '../../helper';

const Container = styled.header`
  width: 100%;
  height: ${rem(81)};
  /* background: linear-gradient(to right, #8250c8 0%, #15b5dd 50%, #8250c8 100%); */
  background: #8250c8;
  position: fixed;
  top: 0;
  left: 0;
`;
const Content = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${rem(960)};
  margin: 0 auto;
  color: #ffffff;
`;

const SearchBox = styled.div`
  background: #fff;
  /* height: 36px; */
  /* padding: 10px; */
  border-radius: ${rem(36)};
  margin-left: ${rem(10)};
  i {
    color: #8f8f8f;
    float: left;
    width: ${rem(36)};
    height: ${rem(36)};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  input {
    border: none;
    background: none;
    outline: none;
    float: right;
    padding: 0;
    transition: 0.4s;
    line-height: ${rem(20)};
    width: ${rem(295)};
    padding: ${rem(8)};
  }
`;
const StyledLogo = styled.div`
  font-size: ${rem(20)};
  display: flex;
  align-items: center;
  span {
    margin: 0 ${rem(10)};
  }
  cursor: pointer;
`;
const MenuItem = styled.div`
  font-size: ${rem(14)};
  line-height: ${rem(81)};
  padding-left: ${rem(25)};
  min-width: ${rem(60)};
  cursor: pointer;
  display: flex;
  align-items: center;
  .expand {
    margin-left: ${rem(2)};
    font-weight: 600;
  }
  img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: ${rem(5)};
  }
  a {
    color: inherit;
  }
  i {
    font-size: ${rem(22)};
  }
  &:hover {
    color: rebeccapurple;
  }
`;
const Rectangle = styled.a`
  width: ${rem(18)};
  height: ${rem(16)};
  align-items: center;
  border-radius: 8px;
  background-color: #ff70d4;
  position: relative;
  top: -10px;
  left: -5px;
`;

class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: 'anonymous',
      address: '',
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.address !== prevState.address) {
      return {
        address: nextProps.address,
      };
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.loaddata();
  }

  componentDidUpdate(prevProps, prevState) {
    const { address } = this.state;
    if (address !== prevState.address) {
      this.loaddata();
    }
  }
  async loaddata() {
    const { address } = this.props;
    console.log('address', address);
    // const reps = await getAlias(address);
    // console.log('reps', reps);
    // this.setState({ username: reps });
  }

  render() {
    const { username } = this.state;
    return (
      <Container>
        <Content>
          <StyledLogo>
            <img src="/static/img/logo.svg" alt="itea-scan" />
            <span>LoveLock</span>
          </StyledLogo>
          <SearchBox>
            <input type="text" name="" placeholder="Search" />
            <a className="search-bt">
              <Icon type="search" />
            </a>
          </SearchBox>
          <FlexBox flex={1} justify="flex-end">
            <MenuItem>
              <img src="/static/img/user-men.jpg" alt="" />
              <a href="/login">{username}</a>
            </MenuItem>
            <MenuItem>
              <a href="/login">Explore</a>
              <Icon className="expand" type="expand_more" />
            </MenuItem>
            <MenuItem>
              <Icon type="group" />
              <Rectangle />
            </MenuItem>
            <MenuItem>
              <Icon type="notifications" />
              <Rectangle />
            </MenuItem>
          </FlexBox>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  const { propose, userInfo, account } = state;
  return {
    address: account.address,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      // dispatch(actions.setPropose(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
