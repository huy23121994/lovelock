import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ZoomImage from './AutoZoomImage';
import ImageCrop from './ImageCrop';
import { applyRotation, imageResize, ensureHashUrl } from '../../helper';
import CustomDatePicker from "./CustomDatePicker";

const Container = styled.div``;
// const ImgList = styled.div`
//   width: 100%;
//   img {
//     width: 100px;
//     height: 100px;
//   }
// `;
const InfoBox = styled.div`
  min-height: 55px;
  /* margin-top: 10px; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* border-top: 1px solid #e1e1e1; */
  border-bottom: ${props => props.grayLayout && '1px solid #e1e1e1'};
  color: #8250c8;
  @media (max-width: 599.95px) {
    display: ${props => (props.grayLayout ? 'flex' : 'none')};
  }
`;
const ActionItem = styled.div`
  display: inline-block;
  position: relative;
  overflow: hidden;
  /* background: #f5f6f7; */
  border-radius: 18px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  color: #8250c8;
  cursor: pointer;
  :hover {
    background: #ebedf0;
  }
  @media (max-width: 599.95px) {
    width: 100%;
    font-size: 14px;
  }
  input {
    cursor: pointer;
    font-size: 50px;
    position: absolute;
    left: 10;
    top: 0;
    opacity: 0;
  }
  i {
    color: #8250c8;
  }
  .icon-upload {
    i {
      margin-right: 10px;
    }
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
`;
const ImgUploadPreview = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  .scrollWrap {
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    position: relative;
    height: 150%;
  }
  .scrollBody {
    position: relative;
    display: inline-block;
  }
  .scrollContent {
    white-space: nowrap;
  }
  .imgContent {
    display: inline-block;
    vertical-align: top;
    margin-right: 5px;
    &:hover {
      opacity: 0.7 !important;
    }
    img {
      animation: fade 0.6s ease-in;
      width: 160px;
      height: 160px;
      object-fit: cover;
    }
    @keyframes fade {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }
`;
const AddMoreImg = styled.span`
  display: inline-block;
  margin-left: 5px;
  vertical-align: top;
  height: 172px;
  /* width: 100%; */
  .addImgBox {
    position: relative;
    display: inline-block;
  }
  .btAddImg {
    margin-right: 12px;
    background-image: url('/static/img/plus.png');
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: 20px;

    border: 2px dashed #dddfe2;
    border-radius: 2px;
    box-sizing: border-box;
    display: inline-block;
    height: 160px;
    margin-right: 5px;
    min-width: 160px;
    position: relative;
    width: auto;

    cursor: pointer;
    text-decoration: none;
  }
  .wrapperInput {
    height: 100%;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }
  .btInput {
    bottom: 0;
    cursor: inherit;
    font-size: 1000px !important;
    height: 300px;
    margin: 0;
    opacity: 0;
    padding: 0;
    position: absolute;
    right: 0;
    outline: none;
  }
`;

const useStyles = makeStyles(theme => ({
  img: {
    display: 'block',
    height: 160,
    '&:hover': {
      '& $icon': {
        display: 'block',
      },
    },
  },
  imgIsCreate: {
    display: 'block',
    height: 100,
    '&:hover': {
      '& $icon': {
        display: 'block',
      },
    },
  },
  title: {
    color: theme.palette.primary.light,
  },
  titleBar: {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  icon: {
    color: 'white',
    display: 'none',
  },
  btnRow: {
    [theme.breakpoints.down('xs')]: {
      margin: '16px 0',
    },
  },
  actionItem: {
    [theme.breakpoints.down('xs')]: {
      borderTop: '1px solid #dadde1',
    },
  },
  blogItem: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
}));

export default function AddInfoMessage(props) {
  const { files, date, coverPhotoMode, onBlogClick, hasParentDialog, onDialogToggle, photoButtonText } = props;
  const { grayLayout = true, onChangeMedia, onChangeDate } = props;
  const [picPreview, setPicPreview] = useState([]);
  const [isOpenCrop, _setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState('');

  const setIsOpenCrop = value => {
    onDialogToggle && onDialogToggle(value);
    _setIsOpenCrop(value);
  };

  useEffect(() => {
    if (files.length === 0) {
      setPicPreview([]);
    } else {
      const urlFiles = files.map(file => {
        let src = '';
        let needRevoke = false;
        if (typeof file === 'string') {
          src = ensureHashUrl(file)
        } else if (file.src) {
          src = file.src;
        } else {
          src = window.URL.createObjectURL(new Blob([file]));
          needRevoke = true
        }
        return { needRevoke, src };
      });

      setPicPreview(urlFiles);
    }
  }, [files]);

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function captureUploadFile(event) {
    event.preventDefault();
    const imgFiles = event.target.files;

    if (imgFiles.length) {
      const arrFiles = Array.from(imgFiles);
      fromFiletToBuffer(arrFiles);
      // let contentBuffer = [];
      // for (let i = 0; i < arrFiles.length; i++) {
      //   contentBuffer.push(readFileAsync(arrFiles[i]));
      // }
      // contentBuffer = await Promise.all(contentBuffer);
      // onChangeMedia([...files, ...contentBuffer]);
    }
  }

  async function fromFiletToBuffer(arrFiles) {
    let contentBuffer = [];
    for (let i = 0; i < arrFiles.length; i++) {
      contentBuffer.push(readFileAsync(arrFiles[i]));
    }
    contentBuffer = await Promise.all(contentBuffer);
    onChangeMedia([...files, ...contentBuffer]);
  }

  function handleImageChange(event) {
    event.preventDefault();
    if (files) removeFile(0);
    const arrFiles = Array.from(event.target.files);
    if (arrFiles.length > 0) {
      setIsOpenCrop(true);
      setOriginFile(arrFiles);
    } else {
      setIsOpenCrop(false);
    }
  }

  function closeCrop() {
    setIsOpenCrop(false);
  }

  async function acceptCrop(e) {
    closeCrop();
    const cropFile = e.cropFile[0];
    const newFile = await applyRotation(cropFile, 1, 1000);
    const saveFile = imageResize(cropFile, newFile);
    const arrFiles = Array.from(saveFile);
    fromFiletToBuffer(arrFiles);
  }

  function removeFile(index) {
    const bufferFiltered = files.filter((value, id) => {
      return id !== index;
    });
    onChangeMedia(bufferFiltered);
  }

  function handleDateChange(value) {
    onChangeDate(Date.parse(value));
  }

  const classes = useStyles();

  return (
    <Container>
      {picPreview.length > 0 && (
        <ImgUploadPreview>
          <div className="scrollWrap">
            <div className="scrollBody">
              <div className="scrollContent">
                {picPreview.map(({ needRevoke, src }, index) => (
                  <div key={index} className="imgContent">
                    <GridListTile className={coverPhotoMode ? classes.imgIsCreate : classes.img}>
                      <ZoomImage src={src} alt="photo" adjust onLoad={() => (needRevoke && URL.revokeObjectURL(src))} />
                      <GridListTileBar
                        className={classes.titleBar}
                        style={{ background: 'none' }}
                        titlePosition="top"
                        actionIcon={
                          <IconButton onClick={() => removeFile(index)}>
                            <CloseIcon className={classes.icon} />
                          </IconButton>
                        }
                      />
                    </GridListTile>
                  </div>
                ))}
                {!coverPhotoMode && (
                  <AddMoreImg>
                    <div className="addImgBox">
                      <div className="btAddImg" rel="ignore">
                        <div className="wrapperInput">
                          <input
                            accept="image/jpeg,image/png,image/gif"
                            title="Choose a file to upload"
                            display="inline-block"
                            type="file"
                            role="button"
                            multiple
                            className="btInput"
                            onChange={captureUploadFile}
                            value=""
                          />
                        </div>
                      </div>
                    </div>
                  </AddMoreImg>
                )}
              </div>
            </div>
          </div>
        </ImgUploadPreview>
      )}
      <InfoBox grayLayout={grayLayout}>
        <Grid container spacing={3} alignItems="center" justify="flex-end" className={classes.btnRow}>
          <Grid item xs={12} sm="auto" className={classes.actionItem}>
            <CustomDatePicker
              date={date}
              handleDateChange={handleDateChange}
              onDialogToggle={onDialogToggle}
            />
          </Grid>
          <Grid item xs={12} sm="auto" className={classes.actionItem}>
            <ActionItem>
              <div className="icon-upload">
                <i className="material-icons">insert_photo</i>
                <div>{photoButtonText || 'Photo'}</div>
              </div>
              <input
                accept={coverPhotoMode ? 'image/jpeg,image/png' : 'image/jpeg,image/png,image/gif'}
                title="Choose a file to upload"
                className="fileInput"
                role="button"
                multiple={!coverPhotoMode}
                type="file"
                value=""
                onChange={coverPhotoMode ? handleImageChange : captureUploadFile}
              />
            </ActionItem>
          </Grid>
          {onBlogClick && (
            <Grid item onClick={onBlogClick} xs={12} sm="auto" className={classes.blogItem}>
              <ActionItem>
                <div className="icon-upload">
                  <i className="material-icons">menu_book</i>
                  <div>Blog</div>
                </div>
              </ActionItem>
            </Grid>
          )}
        </Grid>
      </InfoBox>
      {isOpenCrop && (
        <ImageCrop
          close={closeCrop}
          accept={acceptCrop}
          originFile={originFile}
          isViewSquare
          hasParentDialog={hasParentDialog}
        />
      )}
    </Container>
  );
}
