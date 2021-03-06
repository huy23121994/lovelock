import React, { useState, useRef, useEffect } from 'react';
import LazyLoad from 'react-lazyload';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { getPalette } from '../../../helper/palette';
import Skeleton from '@material-ui/lab/Skeleton';

const defaultColors = {frameBackColor: '#8250c8', labelBackColor: '#8250c8'}

export default function BlogShowcase(props) {
  const [colors, _setColors] = useState(props.colors || {});
  const { classes, photo, title, openHandler } = props;
  const ratio = photo && photo.height / photo.width;
  // current image width on timeline is 627
  // TODO: handle width when responsive
  const height = ratio ? Math.floor(6.27 * ratio) : 160;
  const frameStyle = colors.frameBackColor ? { backgroundColor: colors.frameBackColor } : {};
  if (!photo) {
    frameStyle.paddingBottom = 0;
  }
  const labelStyle = colors.labelBackColor ? { backgroundColor: colors.labelBackColor } : {};

  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const setColors = colors => {
    if (mounted.current) {
      _setColors(colors)
    }
  }

  if (!title) {
    return  <Skeleton variant="rect" width='100%' height={164} />
  }

  return (
    <span className={classes.blogImgWrp} style={frameStyle} onClick={openHandler}>
      <span className={classes.blogTitleImg} style={labelStyle}>
        BLOG
      </span>
      <LazyLoad height={height} offset={12} once>
        <TransitionGroup>
          <CSSTransition classNames="timeline-blog" timeout={1100} appear>
            <img
              src={photo ? photo.url : '/static/img/landing.svg'}
              alt='blog cover'
              className={classes.blogImgTimeline}
              style={photo ? {} : { maxHeight: height, objectFit: 'cover' }}
              onLoad={event => {
                if (!photo) {
                  setColors(defaultColors)
                } else {
                  getPalette(photo.url, { defaultColors })
                    .then(colors => colors && setColors(colors)).catch(console.warn)
                }
              }}
            />
          </CSSTransition>
        </TransitionGroup>
      </LazyLoad>
      <span 
        className={classes.blogFirstLine}
        style={photo ? {} : { 
          position: 'absolute',
          left: 0,
          right: 0,
          top: '40%',
          transform: 'translateY(-50%)'
         }}>{title}</span>
    </span>
  );
}
