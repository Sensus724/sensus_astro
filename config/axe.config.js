module.exports = {
  rules: {
    'color-contrast': { enabled: true },
    'image-alt': { enabled: true },
    'heading-order': { enabled: true },
    'focus-visible': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-role': { enabled: true },
    'button-name': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'region': { enabled: true },
    'tabindex': { enabled: true },
    'title': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  exclude: ['#skip-a11y-test'],
  include: ['body'],
  timeout: 10000,
  retries: 3,
  threshold: {
    violations: 0,
    passes: 100,
    incomplete: 0
  }
};
