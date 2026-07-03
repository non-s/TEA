import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check'
import { app } from './app'

export const CHAVE_RECAPTCHA_APP_CHECK = String(
  import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY ?? '',
).trim()

let instanciaAppCheck: AppCheck | null = null

export function appCheckConfigurado(): boolean {
  return CHAVE_RECAPTCHA_APP_CHECK.length > 0
}

export function inicializarAppCheck(): AppCheck | null {
  if (!appCheckConfigurado()) {
    return null
  }

  if (instanciaAppCheck) {
    return instanciaAppCheck
  }

  instanciaAppCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(CHAVE_RECAPTCHA_APP_CHECK),
    isTokenAutoRefreshEnabled: true,
  })

  return instanciaAppCheck
}
