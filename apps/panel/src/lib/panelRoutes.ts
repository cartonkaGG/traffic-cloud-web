/** Після входу — сторінка оформлення підписки. */
export const BILLING_SUBSCRIBE_PATH = '/billing?gate=1'

export const BILLING_SUBSCRIBE_REDIRECT = encodeURIComponent(BILLING_SUBSCRIBE_PATH)

/** Єдиний вхід на оформлення підписки: спочатку auth, потім billing. */
export const SUBSCRIBE_ENTRY_PATH = `/auth?redirect=${BILLING_SUBSCRIBE_REDIRECT}`
