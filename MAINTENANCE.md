# K-Swiss Theme Maintenance Guide

**Last Updated:** April 21, 2026

---

## 📋 Project Overview

K-Swiss Philippines Shopify Theme - Custom PLP cards with color swatches, admin features, and Shogun integration.

---

## 🔧 Recent Fixes (April 21, 2026)

### Issues Fixed:
- ✅ Removed CSP (Content Security Policy) meta tag that was blocking resources
- ✅ Removed problematic fetch interceptor script
- ✅ Reverted all fetch calls to original implementation
- ✅ Color swatch images now display correctly on product cards
- ✅ CORB (Cross-Origin Read Blocking) errors resolved

### Files Modified:
- `snippets/meta-tags.liquid` - Removed CSP meta tag
- `layout/theme.liquid` - Removed fetch interceptor script
- `assets/*.js` - Reverted fetch calls (9 files)

### Root Cause:
Shopify handles CSP server-side. Client-side CSP meta tags created conflicts with third-party apps and resource loading. Fetch interceptor was interfering with normal image loading.

---

## ⚠️ Critical Rules - DO NOT DO

### 1. **Don't Add CSP Meta Tags**
```liquid
<!-- ❌ BAD - Will break resources -->
<meta http-equiv="Content-Security-Policy" content="..." />
```
**Why:** Shopify's server-side CSP handles this. Client-side CSP conflicts with third-party apps.

### 2. **Don't Modify Fetch Requests with Custom Modes**
```javascript
// ❌ BAD - Will break image loading
fetch(url, { mode: 'no-cors', credentials: 'same-origin' })

// ❌ BAD - Will break requests
fetch(url, { mode: 'cors' })
```
**Why:** Shopify handles CORS properly. Custom modes interfere with native request handling.

### 3. **Don't Add Fetch Interceptors**
```javascript
// ❌ BAD - Will break functionality
const originalFetch = window.fetch;
window.fetch = function(...args) { ... }
```
**Why:** Modifying global fetch breaks third-party scripts and resource loading.

---

## ✅ Testing Checklist

Before committing or deploying, verify:

### Browser Testing
- [ ] Hard refresh with cache clear (`Ctrl+Shift+R`)
- [ ] Check DevTools Console - no errors
- [ ] Check DevTools Network tab - no failed requests

### Functionality Testing
- [ ] **Product Pages**: Load without errors
- [ ] **Color Swatches**: Images display on all products
- [ ] **Add to Cart**: Works properly
- [ ] **Search**: Autocomplete works
- [ ] **Cart/Checkout**: Updates correctly
- [ ] **Mobile**: Responsive on all sizes

### Performance
- [ ] Page load time acceptable
- [ ] No console warnings or errors
- [ ] Network waterfall looks healthy

---

## 🔄 Git Workflow

### Before Making Changes
```bash
# Get latest from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### After Making Changes
```bash
# Stage files
git add .

# Commit with clear message
git commit -m "feat: Clear description of what changed

- Specific change 1
- Specific change 2
- Testing notes if any"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Format
```
type: subject

description (optional)

Examples:
- feat: Add new section
- fix: Resolve CORB errors
- refactor: Clean up cart logic
- docs: Update maintenance guide
- perf: Optimize image loading
```

---

## 🐛 Debugging Guide

### CSP Errors Appearing
**Symptom:** "Content Security Policy of your site blocks some resources"

**Solution:**
1. Check `snippets/meta-tags.liquid` - should NOT have CSP meta tag
2. Hard refresh with cache clear
3. Check if third-party app is injecting CSP (via Shopify admin)

### CORB Errors Appearing
**Symptom:** "Response was blocked by CORB (Cross-Origin Read Blocking)"

**Solution:**
1. **Don't** modify fetch requests
2. Check Shopify admin for app conflicts
3. Hard refresh and clear cache
4. Contact Shopify support if persistent

### Images Not Loading
**Symptom:** Color swatches missing images, or featured images blank

**Solution:**
1. Clear browser cache (`Ctrl+Shift+R`)
2. Check `snippets/card-product.liquid` - image tags should be normal
3. Check Network tab for 404 errors on images
4. Verify image URLs are correct in admin

### Third-Party App Broken
**Symptom:** Giraffly Trust or other app not working

**Solution:**
1. Don't modify fetch or CSP
2. Go to Shopify Admin → Apps & sales channels
3. Reinstall the app
4. Contact app support

---

## 📁 Project Structure

```
KSwissPH/
├── assets/                 # CSS & JavaScript
│   ├── base.css           # Main styles
│   ├── component-*.css    # Component styles
│   ├── global.js          # Global functions
│   ├── custom-card.js     # Custom PLP card
│   └── ...
├── config/                # Shopify config
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/                # Master layouts
│   ├── theme.liquid       # Main layout
│   ├── password.liquid    # Password page
│   └── theme.shogun.landing.liquid
├── sections/              # Section templates
├── snippets/              # Reusable components
│   ├── card-product.liquid      # Product card
│   ├── meta-tags.liquid         # Meta tags (NO CSP!)
│   ├── swatch.liquid            # Color swatches
│   └── ...
├── templates/             # Page templates
├── locales/               # Multi-language
├── MAINTENANCE.md         # This file
└── README.md              # Project readme
```

---

## 🚀 Deployment Checklist

### Before Going Live
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Performance acceptable
- [ ] Mobile responsive verified
- [ ] All third-party apps working
- [ ] Product images displaying
- [ ] Cart functionality working
- [ ] Search/autocomplete working

### Deployment Steps
```bash
# 1. Finalize changes
git add .
git commit -m "Release: v1.x.x - Description"

# 2. Merge to main
git checkout main
git pull origin main
git merge feature/your-feature-name

# 3. Push to production
git push origin main

# 4. Verify in admin
# - Check Shopify admin theme editor
# - Test live site
```

### Post-Deployment
- [ ] Monitor DevTools Console for errors
- [ ] Check Network tab for failed requests
- [ ] Verify all pages load
- [ ] Test on mobile devices
- [ ] Check Analytics for anomalies

---

## 📚 Key Files to Know

| File | Purpose | Modifications |
|------|---------|---|
| `layout/theme.liquid` | Master layout | Remove custom scripts |
| `snippets/meta-tags.liquid` | Page meta tags | NO CSP tags |
| `snippets/card-product.liquid` | Product card display | Keep fetch normal |
| `assets/custom-card.js` | PLP card logic | No fetch interceptors |
| `assets/global.js` | Global functions | Keep fetchConfig clean |

---

## 🆘 Common Issues & Solutions

### Issue: "Dictionary not used for response" (55 errors)
- **Status:** ⚠️ Safe to ignore
- **Reason:** Shopify's translation file warning
- **Action:** None needed

### Issue: Page CSS/JS not updating
- **Solution:** Hard refresh (`Ctrl+Shift+R`) + cache clear
- **Or:** Restart dev server

### Issue: Images broken after changes
- **Solution:** 
  1. Don't modify fetch requests
  2. Verify image URLs in HTML
  3. Clear cache

### Issue: Third-party app conflicts
- **Solution:**
  1. Don't add CSP or modify fetch
  2. Check app settings in Shopify admin
  3. Reinstall app if needed

---

## 📞 Contact & Resources

### Shopify Resources
- [Shopify Theme Development](https://shopify.dev/themes)
- [Shopify Admin API](https://shopify.dev/api/admin)
- [Shopify Community Forums](https://community.shopify.com)

### Tools
- **Admin Panel:** https://k-swiss-philippines.myshopify.com/admin
- **Theme Editor:** https://k-swiss-philippines.myshopify.com/admin/themes
- **DevTools:** Press `F12` in browser

### Dev Environment
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint
```

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-21 | Fixed CSP/CORB errors, removed fetch interceptor | Copilot |
| 2026-04-21 | Created this maintenance guide | Copilot |

---

## ✍️ Notes for Future Developers

1. **Shopify handles security** - Don't try to add CSP, CORS, or security headers client-side
2. **Keep it simple** - The less custom code, the better
3. **Test everything** - Always clear cache and hard refresh
4. **Document changes** - Always update this file when making significant changes
5. **Use git properly** - Clear commit messages help future debugging

---

**Last Reviewed:** April 21, 2026  
**Next Review:** June 21, 2026 (or when making major changes)
