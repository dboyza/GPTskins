/* Paste this file into the ChatGPT browser console, then call collectGPTskinsAudit().
 * Read-only: no navigation, storage access, network requests, or DOM changes.
 * The function is self-contained so computer-use tools can evaluate it directly.
 */
function collectGPTskinsAudit(options = {}) {
  const definitions = [
    ['page', 'body'],
    ['sidebar', '#stage-slideover-sidebar, aside, nav[aria-label], [data-testid="sidebar"]'],
    ['sidebar-section', '.sidebar-expando-section-header'],
    ['sidebar-action', '[data-trailing-button], [data-gptskins-sidebar-action]'],
    ['account', '[data-testid="accounts-profile-button"]'],
    ['composer', 'form:has(#prompt-textarea), [data-testid="composer"]'],
    ['composer-input', '#prompt-textarea'],
    ['composer-submit', '#composer-submit-button'],
    ['suggestions', '[data-gptskins-suggestion-layer], form .top-full .bg-surface-primary, [role="listbox"]'],
    ['work-panel', '.bg-surface-primary:has(> ul)'],
    ['mode-switch', '[role="radiogroup"]:has([data-tpp-toggle-value])'],
    ['mode-track', '[role="radiogroup"]:has([data-tpp-toggle-value]) > .pointer-events-none'],
    ['mode-option', '[data-tpp-toggle-value]'],
    ['user-message', '[data-message-author-role="user"]'],
    ['assistant-message', '[data-message-author-role="assistant"]'],
    ['code-frame', '[data-gptskins-code-frame]'],
    ['code-header', '[data-gptskins-code-header]'],
    ['code-body', '[data-gptskins-code-body], pre'],
    ['code-editor', '.cm-editor'],
    ['code-scroll', '.cm-scroller, [data-gptskins-code-scrollable]'],
    ['code-syntax', '.cm-content span[class]'],
    ['table', '[data-message-author-role] table'],
    ['table-cell', '[data-message-author-role] :is(th, td)'],
    ['citation', '[data-testid="webpage-citation-pill"] a'],
    ['chart', '.recharts-wrapper'],
    ['chart-label', '.recharts-text, .recharts-legend-item-text'],
    ['chart-line', '.recharts-cartesian-grid line, .recharts-cartesian-axis-line'],
    ['writing-block', '[data-testid="writing-block-container"]'],
    ['writing-editor', '.writing-block-editor, [data-testid="writing-block-container"] .ProseMirror'],
    ['writing-edit', '[data-testid="writing-block-header-magic-edit-button"]'],
    ['menu', '[role="menu"], [data-radix-menu-content]'],
    ['menu-item', '[role="menuitem"], [data-radix-menu-content] .__menu-item'],
    ['portal', '[data-radix-popper-content-wrapper]'],
    ['dialog', '[role="dialog"], [aria-modal="true"]'],
    ['dialog-tab', '[role="dialog"] [role="tab"]'],
    ['switch', '[role="switch"]'],
    ['voice-dot', '[role="dialog"] button[role="radio"][aria-checked]'],
    ['plan-card', '[data-pricing-column-content]'],
    ['plan-toggle', '[data-gptskins-plan-toggle]'],
    ['plan-option', '[data-gptskins-plan-toggle-option]'],
    ['plan-cta', '[data-gptskins-plan-cta]'],
    ['thread-bottom', '.thread-bottom-container'],
    ['popover', '[data-testid="stage-thread-flyout"], [data-state="open"][role="tooltip"]']
  ];
  const maxSamples = Math.min(100, Math.max(1, Number(options.maxSamples) || 25));
  const viewport = { width: window.innerWidth, height: window.innerHeight, deviceScaleFactor: window.devicePixelRatio };
  const root = document.documentElement;
  const style = root && getComputedStyle(root);
  const themeAttribute = root?.getAttribute('data-gptskins-theme');
  const theme = themeAttribute ? (/^[a-z0-9-]{1,64}$/.test(themeAttribute) ? themeAttribute : 'unrecognized') : 'default';
  const tokenNames = ['background', 'surface', 'surfaceStrong', 'composer', 'sidebar', 'sidebarHover', 'text', 'mutedText', 'border', 'accent', 'switchTrackChecked'];
  const nativeTokenNames = ['--main-surface-primary', '--main-surface-secondary', '--bg-primary', '--bg-elevated-primary', '--bg-elevated-secondary', '--text-primary', '--text-secondary'];
  // Quoted URL arguments may contain closing parentheses and escaped quotes.
  // Consume the complete CSS string before looking for the closing url() delimiter.
  const safeCSS = value => String(value || '').replace(/url\(\s*(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|(?:\\[\s\S]|[^)\\])*)\s*\)/gi, 'url([redacted])').slice(0, 500);
  const tokens = Object.fromEntries(tokenNames.map(name => [name, safeCSS(style?.getPropertyValue(`--gptskins-${name}`).trim())]));
  const stylesheet = document.getElementById('gptskins-style');
  const stylesheetText = stylesheet?.textContent || '';
  let hash = 2166136261;
  for (let index = 0; index < stylesheetText.length; index++) hash = Math.imul(hash ^ stylesheetText.charCodeAt(index), 16777619);
  const color = value => {
    if (/^#[\da-f]{6}$/i.test(value)) return [1, 3, 5].map(index => Number.parseInt(value.slice(index, index + 2), 16)).concat(1);
    const match = String(value).match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
  };
  const luminance = rgb => rgb.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const contrast = (a, b) => { const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (hi + .05) / (lo + .05); };
  const background = element => {
    let accumulated = [0, 0, 0, 0];
    for (let current = element; current; current = current.parentElement) {
      const computed = getComputedStyle(current);
      if (Number(computed.opacity) !== 1 || computed.filter !== 'none' || computed.mixBlendMode !== 'normal') return null;
      if (accumulated[3] >= .999) continue;
      if (computed.backgroundImage !== 'none') return null;
      const next = color(computed.backgroundColor);
      if (!next) return null;
      const alpha = accumulated[3] + next[3] * (1 - accumulated[3]);
      accumulated = [...[0, 1, 2].map(i => alpha ? (accumulated[i] * accumulated[3] + next[i] * next[3] * (1 - accumulated[3])) / alpha : 0), alpha];
    }
    return accumulated[3] >= .999 ? accumulated : null;
  };
  const findings = [];
  if (theme === 'default' && stylesheet) findings.push({ severity: 'failure', code: 'default-stylesheet', reason: 'Default must remove the injected theme stylesheet.' });
  if (theme !== 'default' && !stylesheet) findings.push({ severity: 'failure', code: 'missing-stylesheet', reason: 'A custom theme is selected but its stylesheet is absent.' });
  const themeBackground = color(tokens.background);
  const surfaces = definitions.map(([id, selector]) => {
    let matches;
    try { matches = [...document.querySelectorAll(selector)]; }
    catch { return { id, selector, status: 'ERROR', reason: 'Selector is unsupported in this browser.', samples: [] }; }
    const visible = matches.filter(element => {
      const bounds = element.getBoundingClientRect();
      const computed = getComputedStyle(element);
      return computed.display !== 'none' && computed.visibility === 'visible' && Number(computed.opacity) > 0 && bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.right > 0 && bounds.top < viewport.height && bounds.left < viewport.width;
    });
    const samples = visible.slice(0, maxSamples).map((element, index) => {
      const computed = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      const cssKeys = ['backgroundColor', 'backgroundImage', 'color', 'borderTopColor', 'borderTopWidth', 'borderTopStyle', 'borderRadius', 'outlineColor', 'outlineWidth', 'boxShadow', 'overflowX', 'overflowY', 'opacity', 'fontSize', 'fontWeight', 'fill', 'stroke', 'strokeWidth', 'colorScheme'];
      const css = Object.fromEntries(cssKeys.map(key => [key, safeCSS(computed[key])]));
      const pseudo = Object.fromEntries(['::before', '::after'].map(name => {
        const paint = getComputedStyle(element, name);
        return [name, { generated: !['none', 'normal', ''].includes(paint.content), backgroundColor: safeCSS(paint.backgroundColor), backgroundImage: safeCSS(paint.backgroundImage), boxShadow: safeCSS(paint.boxShadow), opacity: paint.opacity }];
      }));
      const state = Object.fromEntries(['aria-checked', 'aria-selected', 'aria-disabled', 'aria-expanded'].map(key => [key, ['true', 'false', 'mixed'].includes(element.getAttribute(key)) ? element.getAttribute(key) : null]));
      state.disabled = element.matches(':disabled');
      state.hover = element.matches(':hover');
      state.focusVisible = element.matches(':focus-visible');
      const sample = { index, tag: element.tagName.toLowerCase(), state, bounds: Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Math.round(bounds[key] * 10) / 10])), css, pseudo, nativeTokens: Object.fromEntries(nativeTokenNames.map(name => [name, safeCSS(computed.getPropertyValue(name).trim())])), scroll: { clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight } };
      const hasText = element.namespaceURI !== 'http://www.w3.org/2000/svg' && [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim());
      const foreground = color(computed.color);
      const effectiveBackground = hasText ? background(element) : null;
      sample.textContrast = { status: 'NOT_ASSESSED', reason: hasText ? 'Background compositing, opacity, or color syntax is unsupported.' : 'No direct text node on this sampled element.' };
      if (hasText && foreground?.[3] === 1 && effectiveBackground && !state.disabled && state['aria-disabled'] !== 'true') {
        const minimum = Number.parseFloat(computed.fontSize) >= 24 || (Number.parseFloat(computed.fontSize) >= 18.66 && Number.parseInt(computed.fontWeight, 10) >= 700) ? 3 : 4.5;
        const ratio = contrast(foreground, effectiveBackground);
        sample.textContrast = { status: ratio < minimum ? 'REVIEW' : 'PASS', ratio: Math.round(ratio * 100) / 100, minimum };
        if (ratio < minimum) findings.push({ severity: 'review', code: 'text-contrast', surface: id, sample: index, reason: `Direct text measures ${ratio.toFixed(2)}:1; expected at least ${minimum}:1. Check rendered text and paint before changing CSS.` });
      }
      const ownBackground = color(computed.backgroundColor);
      if (theme !== 'default' && themeBackground && luminance(themeBackground) > .35 && ownBackground?.[3] === 1 && luminance(ownBackground) < .015 && bounds.width * bounds.height > 256 && !['composer-submit', 'user-message', 'code-syntax'].includes(id)) findings.push({ severity: 'review', code: 'dark-surface-on-light-theme', surface: id, sample: index, reason: 'An opaque near-black surface appears within a light custom theme. Native accents, imagery, and deliberate code colors can be valid; inspect this exact element.' });
      return sample;
    });
    return { id, selector, status: samples.length ? 'OBSERVED' : 'NOT_COVERED', matched: matches.length, visible: visible.length, truncated: visible.length > maxSamples, samples };
  });
  return {
    schemaVersion: 1,
    collectedAt: new Date().toISOString(),
    privacy: 'No page URL, title, message text, input values, accessible names, or arbitrary attributes are collected. CSS image URLs are redacted. Review before sharing.',
    theme: { id: theme, font: /^[a-z0-9-]{1,64}$/.test(root?.getAttribute('data-gptskins-font') || '') ? root.getAttribute('data-gptskins-font') : 'default', colorScheme: style?.colorScheme || null, tokens, stylesheet: { present: Boolean(stylesheet), length: stylesheetText.length, fingerprint: stylesheet ? `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}` : null } },
    viewport,
    coverage: { observed: surfaces.filter(surface => surface.status === 'OBSERVED').map(surface => surface.id), notCovered: surfaces.filter(surface => surface.status === 'NOT_COVERED').map(surface => surface.id), errors: surfaces.filter(surface => surface.status === 'ERROR').map(surface => surface.id), truncated: surfaces.filter(surface => surface.truncated).map(surface => surface.id), note: 'Observation is not a visual pass. Only rendered elements intersecting the current viewport were sampled.' },
    findings,
    surfaces
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = { collectGPTskinsAudit };
