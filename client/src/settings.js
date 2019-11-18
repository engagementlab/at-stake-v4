class Settings {
    
    constructor() {
        
        this._api_url =  process.env.NODE_ENV === 'production' ? 'https://aaa.bbb' : 'http://localhost:3001';

    }

}

export default Settings;