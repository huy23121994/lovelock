import React from 'react';
import styled from 'styled-components';
import CommonDialog from './CommonDialog';
import { TagTitle } from './Promise';
import { getAlias } from '../../../helper/';

const ImgView = styled.div`
  margin: 31px 0 31px;
  img {
    width: 100%;
    height: 335px;
  }
`;

const PageView = styled.p`
  font-family: Montserrat;
`;

class PromiseAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sender: '',
      info: '',
      content: '',
      name: '',
    };
  }

  componentDidMount() {
    this.loaddata();
  }

  async loaddata() {
    let { propose, address } = this.props;
    const { index } = this.props;

    const obj = propose.filter(item => item.id === index)[0];
    console.log('loaddata', obj);
    if (obj.status === 0) {
      const addr = address === obj.sender ? obj.receiver : obj.sender;
      // const reps = await getTagsInfo(addr);
      const name = await getAlias(addr);
      obj.name = name;
      this.setState({
        sender: obj.sender,
        name: obj.name,
        info: obj.info,
        content: obj.s_content,
      });
    }
  }

  render() {
    const { deny, close, accept, address } = this.props;
    const { sender, info, content, name } = this.state;
    const infoParse = info && JSON.parse(info);
    const hash = (infoParse && infoParse.hash) || '';
    console.log('infoParse', infoParse);
    // console.log('view state', this.state);
    return (
      <div>
        <CommonDialog
          title="Promise alert"
          okText="Accept"
          cancelText="Deny"
          close={close}
          cancel={deny}
          confirm={accept}
          isCancel
        >
          <TagTitle>{address === sender ? 'You send ' + name + ' a promise' : name + ' send you a promise'}</TagTitle>
          <ImgView>
            <img src={'https://ipfs.io/ipfs/' + hash} className="postImg" alt="promiseImg" />
          </ImgView>
          <PageView>{content}</PageView>
        </CommonDialog>
      </div>
    );
  }
}

PromiseAlert.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {},
};

export default PromiseAlert;
