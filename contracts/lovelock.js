const { expect, validate } = require(';');
const Joi = require('@hapi/joi');
const { expectLockOwners, expectLockContributors, getDataByIndex, expectOwner, expectAdmin, expectUserApproved } = require('./helper.js');
const {
  apiCreateLock,
  apiEditLock,
  apiChangeLockName,
  apiAcceptLock,
  apiCancelLock,
  apiFollowLock,
  apiLikeLock,
  apiAddContributorsToLock,
  apiRemoveContributorsToLock,
  apiChangeLockImg,
  apiGetLocksFollowingPersionByAddress,
  apiGetLocksFollowingByAddress,
  apiGetDetailLock,
  apiGetLocksByAddress,
  apiGetLocksForFeed,
  apiGetDataForMypage,
  apiDeleteLock,
} = require('./apiLock.js');
const {
  apiCreateMemory,
  apiEditMemory,
  apiLikeMemory,
  apiCommentMemory,
  apiGetMemoriesByLock,
  apiGetMemoriesByRange,
  apiGetMemoriesByListMemIndex,
  apiDeleteMemory,
  apiDeleteComment,
} = require('./apiMemory.js');
const { importState, exportState, migrateState } = require('./migration.js')(this);

@contract
class LoveLock {
  // crush bot
  @view botAddress = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn';

  constructor(account) {
    // const owner = this.getOwner();
    if (!account) {
      account = msg.sender;
    }
    // owner.push(account);
    // this.setOwner(owner);
    this.addAdmins([account]);
  }

  // @view getOwner = () => this.getState('ownerContract', []);
  // setOwner = value => this.setState('ownerContract', value);

  @view getLocks = () => this.getState('locks', []);
  setLocks = value => this.setState('locks', value);
  getLock = index => {
    const locks = this.getLocks();
    return [getDataByIndex(locks, index), locks];
  };

  @view getMemories = () => this.getState('memories', []);
  setMemories = value => this.setState('memories', value);
  getMemory = index => {
    const memories = this.getMemories();
    return [getDataByIndex(memories, index), memories];
  };

  // mapping: address to lock
  // 1:n { 'address':[1,2,3...] }
  @view getA2l = () => this.getState('a2l', {});
  setA2l = value => this.setState('a2l', value);

  // mapp address -> following locks.
  // 1:n  { 'address':[lockIndex1, lockIndex2,...] }
  @view getAFL = () => this.getState('afl', {});
  setAFL = value => this.setState('afl', value);

  // mapping: person -> other person
  // 1:n { 'address':[address1,address2,address3...] }
  @view getFollowing = () => this.getState('following', {});
  setFollowing = value => this.setState('following', value);

  @view getFollowed = () => this.getState('followed', {});
  setFollowed = value => this.setState('followed', value);

  @transaction createLock(s_content: string, receiver: ?address, s_info = {}, bot_info): number {
    const self = this;
    expectUserApproved(self);
    return apiCreateLock(self, s_content, receiver, s_info, bot_info);
  }
  @transaction editLock(lockIndex: number, data, contributors) {
    const self = this;
    expectUserApproved(self)
    return apiEditLock(self, lockIndex, data, contributors)
  }
  @transaction changeLockName(index: number, lockName: string) {
    const self = this;
    expectUserApproved(self);
    return apiChangeLockName(self, index, lockName);
  }
  @transaction acceptLock(index: number, r_content: string) {
    const self = this;
    expectUserApproved(self);
    return apiAcceptLock(self, index, r_content);
  }
  @transaction cancelLock(index: number, r_content: string) {
    const self = this;
    expectUserApproved(self);
    return apiCancelLock(self, index, r_content);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikeLock(index: number, type: number) {
    const self = this;
    // expectUserApproved(self);
    return apiLikeLock(self, index, type);
  }
  @transaction followLock(index: number) {
    const self = this;
    // expectUserApproved(self);
    return apiFollowLock(self, index);
  }
  @transaction addContributorsToLock(index: number, contributors = []) {
    const self = this;
    // expectUserApproved(self);
    return apiAddContributorsToLock(self, index, contributors);
  }
  @transaction removeContributorsToLock(index: number, contributors = []) {
    const self = this;
    // expectUserApproved(self);
    return apiRemoveContributorsToLock(self, index, contributors);
  }
  @transaction changeCoverImg(index: number, imgHash: string) {
    const self = this;
    expectUserApproved(self);
    return apiChangeLockImg(self, index, imgHash);
  }
  @view getLockByAddress(addr: address) {
    const self = this;
    return apiGetLocksByAddress(self, addr);
  }
  @view getDetailLock(index: number) {
    const self = this;
    return apiGetDetailLock(self, index);
  }
  @view getLikeByLockIndex = (index: number) => this.getLock(index)[0].likes;
  @view getFollowByLockIndex = (index: number) => this.getLock(index)[0].follows;
  @view getLocksForFeed = (addOrAlias: string) => {
    const self = this;
    let address = addOrAlias;
    if (!isValidAddress(addOrAlias)) {
      address = convertAliasToAddress(addOrAlias);
    }
    return apiGetLocksForFeed(self, address);
  };
  @view getMaxLocksIndex = () => {
    const locks = this.getLocks();
    return locks.length - 1;
  };
  // =========== MEMORY ================
  // info { img:Array, location:string, date:string }
  @transaction addMemory(lockIndex: number, isPrivate: boolean, content: string, info) {
    const self = this;
    expectUserApproved(self);
    return apiCreateMemory(self, lockIndex, isPrivate, content, info);
  }
  @transaction editMemory(memIndex: number, content: string, info) {
    const self = this;
    expectUserApproved(self);
    return apiEditMemory(self, memIndex, content, info);
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const self = this;
    // expectUserApproved(self);
    return apiLikeMemory(self, memoIndex, type);
  }
  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const self = this;
    expectUserApproved(self);
    return apiCommentMemory(self, memoIndex, content, info);
  }
  @view getMemoriesByLockIndex(lockIndex: number, collectionId: ?number, page, pageSize, loadToCurrentPage) {
    const self = this;
    return apiGetMemoriesByLock(self, lockIndex, collectionId, page, pageSize, loadToCurrentPage);
  }
  @view getMemoriesByRange(start: number, end: number) {
    const self = this;
    return apiGetMemoriesByRange(self, start, end);
  }
  @view getMemoriesByListMemIndex(listMemIndex, page, pageSize, loadToCurrentPage) {
    const self = this;
    return apiGetMemoriesByListMemIndex(self, listMemIndex, page, pageSize, loadToCurrentPage);
  }
  @view getLikeByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].likes;
  @view getCommentsByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].comments;
  // =========== COLLECTION ================
  @view getLockCollections(lockIndex: number) {
    const [lock] = this.getLock(lockIndex);

    // Note: the collection is not sorted by ID, client should sort if desired
    return lock.collections || [];
  }

  validateCollectionName = (newName, collections) => {
    if (!newName || !newName.trim()) throw new Error('Invalid name.');
    const normalName = newName.trim().normalize();
    if (normalName.length < 4 || normalName.length > 16) {
      throw new Error(`Collection name must be 4~16 characters.`);
    }
    const lname = normalName.toLowerCase();

    collections.forEach(({ name }) => {
      if (lname === name.toLowerCase()) {
        throw new Error(`Collection name ${newName} already exists.`);
      }
    });

    return normalName;
  };

  @transaction addLockCollection(lockIndex: number, collectionData): number {
    const [lock, locks] = this.getLock(lockIndex);
    expectLockContributors(lock);
    expectUserApproved(this);
    const cols = (lock.collections = lock.collections || []);
    const MAX_COLLECTION_PER_LOCK = 5;
    if (cols.length >= MAX_COLLECTION_PER_LOCK) {
      throw new Error(`This lock already has ${MAX_COLLECTION_PER_LOCK} collections and cannot create more.`);
    }

    collectionData = validate(
      collectionData,
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        avatar: Joi.string(),
        banner: Joi.string(),
      })
        .label('collectionData')
        .required()
    );

    collectionData.name = this.validateCollectionName(collectionData.name, cols);

    lock.nextCollectionId = lock.nextCollectionId || 0;
    collectionData.id = lock.nextCollectionId;
    lock.nextCollectionId++;
    cols.push(collectionData);

    this.setLocks(locks);

    return collectionData.id;
  }

  @transaction setLockCollection(lockIndex: number, collectionId: number, collectionData) {
    const [lock, locks] = this.getLock(lockIndex);
    expectLockContributors(lock);
    expectUserApproved(this);

    collectionData = validate(
      collectionData,
      Joi.object({
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        avatar: Joi.string(),
        banner: Joi.string(),
      })
        .label('collectionData')
        .or('name', 'description', 'avatar', 'banner')
    );

    if (collectionData != null && collectionData.hasOwnProperty('id') && collectionData.id !== collectionId) {
      throw new Error(
        `The specified collectionId ${collectionId} does not match collectionData.id ${collectionData.id}`
      );
    }

    const cols = (lock.collections = lock.collections || []);
    if (collectionData.hasOwnProperty('name')) {
      collectionData.name = this.validateCollectionName(collectionData.name, cols);
    }

    const oldIndex = cols.findIndex(c => c.id === collectionId);
    const old = oldIndex >= 0 ? cols[oldIndex] : null;
    if (old) {
      if (collectionData == null) {
        // delete
        cols.splice(oldIndex, 1);

        // this method is faster but not sorted
        // cols[oldIndex] = cols[cols.length - 1]
        // cols.pop()
      } else {
        // update
        Object.assign(old, collectionData);
      }
    } else {
      // It is an error
      // If user wants to create new, should use addLockCollection method instead
      throw new Error(`Collection id ${collectionId} does not exist in lock ${lockIndex}`);
    }

    this.setLocks(locks);
  }
  // =========== OTHER ================
  @transaction followPerson(addOrAlias: string) {
    let address = addOrAlias;
    if (!isValidAddress(addOrAlias)) {
      address = convertAliasToAddress(addOrAlias);
    }
    // expectUserApproved(this);
    const sender = msg.sender;
    const following = this.getFollowing();
    const followed = this.getFollowed();
    if (!following[sender]) following[sender] = [];
    const index = following[sender].indexOf(address);
    if (index !== -1) {
      // unfollowLock
      following[sender].splice(index, 1);
    } else {
      //  followLock
      following[sender].push(address);
    }
    if (!followed[address]) followed[address] = [];
    const index2 = followed[address].indexOf(sender);
    if (index2 !== -1) {
      // unfollowLock
      followed[address].splice(index2, 1);
    } else {
      //  followLock
      followed[address].push(sender);
    }

    this.setFollowing(following);
    this.setFollowed(followed);
  }

  @view getFollowedPerson = (addOrAlias: string) => {
    let address = addOrAlias;
    if (!isValidAddress(addOrAlias)) {
      address = convertAliasToAddress(addOrAlias);
    }
    return this.getFollowed()[address] || [];
  };

  @view getFollowingPerson = (addr: address) => this.getFollowing()[addr] || [];
  @view getLocksFollowingByAddress = (addr: address) => apiGetLocksFollowingByAddress(this, addr);
  @view getLocksFollowingPersionByAddress = (addr: address) => apiGetLocksFollowingPersionByAddress(this, addr);

  @view getDataForMypage(addOrAlias: string) {
    const self = this;
    let address = addOrAlias;
    if (!isValidAddress(addOrAlias)) {
      address = convertAliasToAddress(addOrAlias);
    }
    return apiGetDataForMypage(self, address);
  }

  // ========== DATA MIGRATION =============
  @view exportState() {
    return exportState();
  }

  @transaction importState(data, overwrite: ?boolean = false) {
    expectOwner(this);
    return importState(data, overwrite);
  }

  @transaction migrateState(fromContract: string, overwrite: ?boolean = false) {
    expectOwner(this);
    return migrateState(fromContract, overwrite);
  }
  // ========== DELETE DATA  =============
  @view getAdmins = () => this.getState('admins', []);
  setAdmins = value => this.setState('admins', value);

  @transaction addAdmins(accounts) {
    expectOwner(this);
    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    accounts = validate(accounts, schema);
    let admins = this.getAdmins();
    accounts = accounts.filter(addr => {
      return !admins.includes(addr);
    });
    admins = admins.concat(accounts);
    this.setAdmins(admins);
    // auto add into users
    // this.addUsers(accounts);
    return accounts;
  }

  @transaction removeAdmins(accounts) {
    expectOwner(this);
    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    accounts = validate(accounts, schema);
    let admins = this.getAdmins();
    admins = admins.filter(addr => {
      return !accounts.includes(addr);
    });
    this.setAdmins(admins);
    return accounts;
  }

  @transaction deleteLock(lockindex: number) {
    const self = this;
    expectAdmin(self);
    return apiDeleteLock(self, lockindex);
  }
  @transaction deleteMemory(memIndex: number) {
    const self = this;
    return apiDeleteMemory(self, memIndex);
  }
  @transaction deleteComment(memIndex: number, cmtNo: number) {
    const self = this;
    return apiDeleteComment(self, memIndex, cmtNo);
  }

  // ==== EDITOR CHOICE (for Explore menu) ===
  @view getChoices = () => this.getState('choices', []);
  setChoices = value => this.setState('choices', value);

  @view getChoiceMemories = (extra, page, pageSize, loadToCurrentPage) => {
    let choices = this.getState('choices', []);

    if (extra != null ) {
      choices = choices.concat(extra)
    }

    if (!choices.length) {
      return []
    }

    return apiGetMemoriesByListMemIndex(this, choices, page, pageSize, loadToCurrentPage)
  }

  @transaction addChoices(_choices) {
    expectAdmin(this);

    if (!Array.isArray(_choices)) {
      _choices = [_choices];
    }

    const schema = Joi.array().items(
      Joi.number().min(0).integer()
    );

    _choices = validate(_choices, schema);

    const oldChoices = this.getChoices();

    // merge the two array, use Set to remove duplicaton
    const newChoices = [...new Set([...oldChoices, ..._choices])]

    // save new choices
    this.setChoices(newChoices)

    // return nothing
  }

  @transaction removeChoices(_choices) {
    expectAdmin(this);

    expectAdmin(this);

    if (!Array.isArray(_choices)) {
      _choices = [_choices];
    }

    const schema = Joi.array().items(
      Joi.number().min(0).integer()
    );

    _choices = validate(_choices, schema);


    const oldChoices = this.getChoices();

    const newChoices = oldChoices.filter(i => !_choices.includes(i));

    this.setChoices(newChoices)
  }

  @view isEditorChosen(memoIndex: number): boolean {
    const choices = this.getChoices();
    return choices.includes(memoIndex);
  }

  // ========== USER APPROVED =============
  @view getUsers = () => this.getState('users', []);
  setUsers = value => this.setState('users', value);

  @transaction addUsers(_users) {
    expectAdmin(this);
    if (!Array.isArray(_users)) {
      _users = [_users];
    }

    _users = _users.map(user => {
      if (!isValidAddress(user)) {
        user = convertAliasToAddress(user);
      }
      return user;
    });

    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    _users = validate(_users, schema);
    let users = this.getUsers();
    users = users.filter(addr => {
      return !_users.includes(addr);
    });
    users = users.concat(_users);
    this.setUsers(users);
    return _users;
  }

  @transaction removeUsers(_users) {
    expectAdmin(this);
    if (!Array.isArray(_users)) {
      _users = [_users];
    }

    _users = _users.map(user => {
      if (!isValidAddress(user)) {
        user = convertAliasToAddress(user);
      }
      return user;
    });
    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    _users = validate(_users, schema);
    let users = this.getUsers();
    users = users.filter(addr => {
      return _users.indexOf(addr) === -1;
    });
    this.setUsers(users);
    return _users;
  }
  @view isUserApproved(user: address) {
    const users = this.getUsers();
    return users.includes(user);
  }

  // ========== Authorized IPFS APPROVED =============
  @view isAuthorized(mainAddress: address, tokenAddress: address, contract: string) {

    // expectUserApproved(self, { from: mainAddress });
    const users = this.getUsers();
    if (!users.includes(mainAddress)) {
      return false;
    }

    // check tokenAddress is token on mainaddress.

    const ctDid = loadContract('system.did')
    try {
      const to = contract.includes('.') ? convertAliasToAddress(contract) : contract
      ctDid.checkPermission.invokeView(mainAddress, { signers: [tokenAddress], to })
      return true
    } catch (e) {
      return false
    }
  }

  @view isUserApproved(mainAddress: address) {
    const users = this.getUsers();
    return users.includes(mainAddress);
  }
}

function convertAliasToAddress(alias) {
  const ctAlias = loadContract('system.alias');
  if (!alias.startsWith('account.') && !alias.startsWith('contract.')) {
    alias = 'account.' + alias
  }
  return ctAlias.resolve.invokeView(alias) || ''
}
