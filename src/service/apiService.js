import { callView, getJsonFromIpfs } from '../helper';

async function addInfoToMems(memorydata, isDetailScreen = false) {
  const newMems = [];
  for (let i = 0; i < memorydata.length; i++) {
    const mem = memorydata[i];
    if (mem.isPrivate) {
      mem.isUnlock = false;
    } else {
      mem.isUnlock = true;
    }
    for (let j = 0; j < mem.info.hash.length; j++) {
      // eslint-disable-next-line no-await-in-loop
      mem.info.hash[j] = await getJsonFromIpfs(mem.info.hash[j], j);
    }
    mem.isDetailScreen = isDetailScreen;
    newMems.push(mem);
  }
  return newMems;
}

const APIService = {
  getMemoriesByListMemIndex: async (arrayMem, page = false, pageSize = false, loadToCurrentPage = false) => {
    const memoryData = await callView('getMemoriesByListMemIndex', [arrayMem, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData);
  },
  getLocksForFeed: async address => {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    return lockForFeed;
  },
  getDetailLock: async index => {
    const lock = await callView('getDetailLock', [index]);
    const proInfo = lock[0] || {};

    // add basic extra info
    proInfo.index = index;
    proInfo.coverImg = proInfo.coverImg || 'QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM';
    proInfo.isJournal = proInfo.sender === proInfo.receiver;
    proInfo.isCrush = proInfo.receiver === process.env.REACT_APP_BOT_LOVER;
    proInfo.isCouple = !proInfo.isJournal && !proInfo.isCrush;

    return proInfo;
  },
  getMemoriesByLockIndex: async (lockIndex, validCollectionId, page, pageSize, loadToCurrentPage) => {
    const memoryData = await callView('getMemoriesByLockIndex', [lockIndex, validCollectionId, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData, true);
  },
  getChoiceMemories: async (extra, page, pageSize, loadToCurrentPage) => {
    const memoryData = await callView('getChoiceMemories', [extra, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData);
  },
};

export default APIService;
