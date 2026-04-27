// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  defaultauth: 'lms',
  apiUrl: 'https://lms-api-dev-01.mwsc.com.mv',
  device: 'WEB',
  client: 'LMS_ADMIN_PORTAL',
  msal: {
    clientId: 'YOUR_AZURE_AD_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: 'http://localhost:4200',
    scopes: ['openid', 'profile', 'email']
  },
  asana: {
    personalAccessToken: '',
    projectGid: '1210351531343849' // LMS - Admin Portal Frontend
  },
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
