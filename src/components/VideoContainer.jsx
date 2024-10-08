import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import useCurrentChannel from '../store/useCurrentChannel';

import ChannelQualityInfo from './ChannelQualityInfo';
import PlayIcon from '../icons/PlayIcon';
import useModal from '../store/useModal';

let hls = null;

// https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
let config = {
  debug: true,
  maxBufferLength: 60 * 30, // a new fragment will be loaded till the buffer length reaches 30 minutes
  maxMaxBufferLength: 60 * 60 // maximum buffer length is 60 minutes
}

export default function VideoContainer() {
  const videoRef = useRef();
  const [currentChannel, currentChannelActions] = useCurrentChannel();
  const [_, modalActions] = useModal();

  const onManifestParsed = (_, data) => {
    currentChannelActions.setQualityLevels(data.levels)
  }

  const onHlsError = (event, data) => {
    //console.log('HLS.Events.ERROR: ', event, data);
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          modalActions.setContent({ title: 'NETWORK_ERROR', content: <p>{currentChannel.url}</p> });
          hls.destroy();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          modalActions.setContent({ title: 'MEDIA_ERROR', content: <p>{currentChannel.url}</p> });
          hls.recoverMediaError();
          break;
        default:
          hls.destroy();
          break;
      }
    }

    localStorage.clear('current-channel');
  }

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (hls) hls.destroy();

    if (currentChannel.type === 'm3u8') {
      if (Hls.isSupported() && currentChannel.type === 'm3u8') {
        hls = new Hls(config);
        hls.loadSource(currentChannel.url);
        hls.attachMedia(video);
        hls.currentLevel = parseInt(currentChannel.qualityIndex, 10);

        hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.on(Hls.Events.ERROR, onHlsError);
      }
      else {
        video.src = currentChannel.url;
        video.addEventListener('canplay', async () => {
          await video.play();
        });
      }
    }

    return () => {
      if (hls) {
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.off(Hls.Events.ERROR, onHlsError);
      }
    }
  }, [currentChannel.url, currentChannel.qualityIndex]);

  return <>
    {currentChannel && currentChannel.type === 'iframe'
      ? <iframe
        className='w-100 br7'
        title={currentChannel.name}
        src={currentChannel.url}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen></iframe>
      : <video className='br7 mb-1' ref={videoRef} src={currentChannel.url} controls autoPlay></video>}

    <div className='w-100'>
      <div className='text-left d-flex align-center mb-1 yellow'>
        <PlayIcon width='12' height='12' />
        <span className='ml-1 uppercase mr-2'>{currentChannel.name}</span>
        <p className='m-0 text-left truncate white'>({currentChannel.url})</p>
      </div>
      <ChannelQualityInfo />
    </div>
  </>
}
