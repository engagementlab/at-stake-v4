class GameData {
  constructor() {
    this.socketId = null;
    this._gameId = null;
  }

  /**
   * @returns {GameData}
   */
  static get() {
    if (GameData.instance == null) {
      GameData.instance = new GameData();
    }

    return this.instance;
  }

  setData(data) {
    // Log player in
    this.send('login:submit', {
      username: data.username,
      joinCode: data.joinCode,
      uid: data.uid,
    });

    // Session started, let's sign-up the decider for this room
    this.send('room', data);
  }

  assemble(appendData) {
    // Append game ID if provided or does not match cached
    if (appendData) {
      const newCode = appendData.joinCode && (this._gameId !== appendData.joinCode);
      if ((this._gameId && appendData.joinCode) || newCode) this._gameId = appendData.joinCode;
    }

    // Always append game ID to payload
    const data = {
      gameId: this._gameId.toUpperCase().trim(),
    };
    const payload = {
      ...data,
      ...{
        msgData: appendData,
      },
    };

    return payload;
  }
}

GameData.instance = null;

export default GameData;
