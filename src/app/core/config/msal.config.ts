import {
  BrowserCacheLocation,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';
import { environment } from 'src/environments/environment';

export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId,
      authority: environment.msal.authority,
      redirectUri: environment.msal.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      loggerOptions: {
        logLevel: environment.production ? LogLevel.Error : LogLevel.Warning,
        piiLoggingEnabled: false
      }
    }
  });
}

export const msalGuardConfig = {
  interactionType: 'popup' as any,
  authRequest: {
    scopes: environment.msal.scopes
  }
};

export const msalInterceptorConfig = {
  interactionType: 'popup' as any,
  protectedResourceMap: new Map<string, string[]>()
};
