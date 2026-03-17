// Utilitaire pour la conversion des devises
// Taux de conversion actualisés (peuvent être mis à jour régulièrement)

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: Date
}

// Taux de conversion EUR vers MAD
export const EUR_TO_MAD_RATE = 10.85

// taux de conversion disponibles
export const EXCHANGE_RATES: Record<string, number> = {
  'EUR-MAD': EUR_TO_MAD_RATE,
  'MAD-EUR': 1 / EUR_TO_MAD_RATE,
  'EUR-USD': 1.08,
  'USD-EUR': 1 / 1.08,
}

/**
 * Convertit un montant d'une devise à une autre
 * @param amount Montant à convertir
 * @param fromCurrency Devise source (ex: 'EUR')
 * @param toCurrency Devise cible (ex: 'MAD')
 * @returns Montant converti
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  
  const key = `${fromCurrency}-${toCurrency}`
  const rate = EXCHANGE_RATES[key]
  
  if (!rate) {
    throw new Error(`Taux de conversion non disponible pour ${fromCurrency} vers ${toCurrency}`)
  }
  
  return amount * rate
}

/**
 * Formate un montant dans la devise spécifiée
 * @param amount Montant à formater
 * @param currency Devise (ex: 'EUR', 'MAD')
 * @param locale Paramètres régionaux (ex: 'fr-FR', 'fr-MA')
 * @returns Chaîne formatée
 */
export function formatCurrency(amount: number, currency: string, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formate un montant en EUR
 */
export function formatEUR(amount: number): string {
  return formatCurrency(amount, 'EUR', 'fr-FR')
}

/**
 * Formate un montant en MAD
 */
export function formatMAD(amount: number): string {
  return formatCurrency(amount, 'MAD', 'fr-MA')
}

/**
 * Convertit EUR en MAD et formate le résultat
 */
export function convertEURtoMADFormatted(eurAmount: number): string {
  const madAmount = convertCurrency(eurAmount, 'EUR', 'MAD')
  return formatMAD(madAmount)
}

/**
 * Affiche un montant avec les deux devises (EUR et MAD)
 */
export function displayDualCurrency(amountEUR: number): {
  eur: string
  mad: string
  rate: string
} {
  return {
    eur: formatEUR(amountEUR),
    mad: convertEURtoMADFormatted(amountEUR),
    rate: `1 EUR ≈ ${EUR_TO_MAD_RATE} MAD`
  }
}
