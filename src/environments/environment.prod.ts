export const environment = {
  production: true,
  defaultauth: 'lms',
  apiUrl: 'https://lms-api-dev-01.mwsc.com.mv',
  device: 'WEB',
  client: 'LMS_ADMIN_PORTAL',
  msal: {
    clientId: 'YOUR_AZURE_AD_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'https://lms-admin.mwsc.com.mv',
    scopes: ['openid', 'profile', 'email']
  },
  asana: {
    personalAccessToken: '',
    projectGid: '1210351531343849' // LMS - Admin Portal Frontend
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
