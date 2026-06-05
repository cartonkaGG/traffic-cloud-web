export type PayNetworkId = 'trc20' | 'bep20'

export type PayNetworkOption = {
  id: PayNetworkId
  label: string
  chain: string
  currency: 'usdttrc20' | 'usdtbsc'
  hint: string
}

export const PAY_NETWORKS: PayNetworkOption[] = [
  {
    id: 'trc20',
    label: 'TRC-20',
    chain: 'Tron',
    currency: 'usdttrc20',
    hint: 'Низькі комісії · швидке зарахування'
  },
  {
    id: 'bep20',
    label: 'BEP-20',
    chain: 'BNB Chain',
    currency: 'usdtbsc',
    hint: 'Сумісно з Binance Smart Chain'
  }
]

export function networkById(id: PayNetworkId): PayNetworkOption {
  return PAY_NETWORKS.find((n) => n.id === id) ?? PAY_NETWORKS[0]
}
