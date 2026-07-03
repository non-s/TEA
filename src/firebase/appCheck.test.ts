import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  appCheck: { nome: 'app-check' },
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(function (
    this: { siteKey?: string },
    siteKey: string,
  ) {
    this.siteKey = siteKey
  }),
}))

vi.mock('./app', () => ({
  app: { name: 'tea' },
}))

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: mocks.initializeAppCheck,
  ReCaptchaV3Provider: mocks.ReCaptchaV3Provider,
}))

async function carregarAppCheck() {
  vi.resetModules()
  return import('./appCheck')
}

describe('Firebase App Check', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    mocks.initializeAppCheck.mockReturnValue(mocks.appCheck)
  })

  it('fica desativado quando a chave reCAPTCHA nao foi configurada', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY', '')

    const { appCheckConfigurado, inicializarAppCheck } =
      await carregarAppCheck()

    expect(appCheckConfigurado()).toBe(false)
    expect(inicializarAppCheck()).toBeNull()
    expect(mocks.initializeAppCheck).not.toHaveBeenCalled()
  })

  it('inicializa com reCAPTCHA v3 e reutiliza a mesma instancia', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY', ' site-key ')

    const { appCheckConfigurado, inicializarAppCheck } =
      await carregarAppCheck()

    const primeiraInstancia = inicializarAppCheck()
    const segundaInstancia = inicializarAppCheck()

    expect(appCheckConfigurado()).toBe(true)
    expect(primeiraInstancia).toBe(mocks.appCheck)
    expect(segundaInstancia).toBe(primeiraInstancia)
    expect(mocks.ReCaptchaV3Provider).toHaveBeenCalledTimes(1)
    expect(mocks.ReCaptchaV3Provider).toHaveBeenCalledWith('site-key')
    expect(mocks.initializeAppCheck).toHaveBeenCalledTimes(1)
    expect(mocks.initializeAppCheck).toHaveBeenCalledWith(
      { name: 'tea' },
      {
        provider: { siteKey: 'site-key' },
        isTokenAutoRefreshEnabled: true,
      },
    )
  })
})
