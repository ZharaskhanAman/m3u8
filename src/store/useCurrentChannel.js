import { createStore, createHook } from 'react-sweet-state';

const localQualityIndex = localStorage.getItem('quality') || -1;
const localChannel = localStorage.getItem('current-channel');
const channel = localChannel ? JSON.parse(localChannel) : {
  name: '🐥 Balapan',
  type: "m3u8",
  url: 'https://cdn01.qazcdn.com/balapantv/balapantv/playlist.m3u8'
};

const Store = createStore({
  initialState: {
    ...channel,
    qualityIndex: +localQualityIndex, // auto: -1
    qualityLevels: []
  },

  actions: {
    set: (channel) => ({ setState, getState }) => {
      setState({ ...getState(), ...channel });
      localStorage.setItem('current-channel', JSON.stringify(channel));
    },
    setQualityLevels: (qualityLevels) => ({ setState, getState }) => {
      setState({ ...getState(), qualityLevels });
    },
    setQualityIndex: (qualityIndex) => ({ setState, getState }) => {
      setState({ ...getState(), qualityIndex });
      localStorage.setItem('quality', qualityIndex);
    },
  },

  name: 'useCurrentChannel',
});

const useCurrentChannel = createHook(Store);
export default useCurrentChannel;