export function formatProxyProbeError(code: string): string {
  switch (code) {
    case 'timeout':
      return 'Таймаут — проксі не відповідає або блокує з’єднання з сервера API'
    case 'connection_refused':
      return 'З’єднання відхилено — перевірте host і порт'
    case 'host_not_found':
      return 'Host не знайдено (DNS)'
    case 'invalid_port':
      return 'Порт має бути числом 1–65535'
    case 'proxy_host_required':
      return 'Вкажіть host проксі'
    case 'proxy_not_configured':
      return 'Проксі не налаштовано для цього акаунта'
    default:
      return code
  }
}
