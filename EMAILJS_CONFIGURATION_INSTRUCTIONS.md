# 📧 EmailJS Configuration Instructions

## ✅ What You Have

**Service ID**: `service_lcskdxo`

**Templates**:
1. **Contact Us** - Template ID: `template_amveg2r`
   - Purpose: Reply to contact form messages
   
2. **Welcome** - Template ID: `template_il00l6d`
   - Purpose: User approval notifications

---

## ⚠️ MISSING: Public Key

You need to get your **Public Key** from EmailJS dashboard.

### How to Find Your Public Key:

1. Go to https://dashboard.emailjs.com/
2. Click on **"Account"** (top right)
3. Go to **"General"** tab
4. Under **"API Keys"** section
5. Copy the **"Public Key"** (looks like: `aBcDeFgHiJkLmNoPqRs`)

---

## 📝 Once You Have the Public Key

### Create `.env` File:

```bash
cd /home/user/webapp
cp .env.example .env
```

### Add These Lines to `.env`:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE
VITE_EMAILJS_SERVICE_ID=service_lcskdxo
VITE_EMAILJS_TEMPLATE_ID=template_il00l6d
VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID=template_amveg2r
```

**Replace** `YOUR_PUBLIC_KEY_HERE` with your actual public key.

---

## 🔍 Template Mapping

Based on your template names:

### Template 1: "Welcome" (template_il00l6d)
**Used for**: User approval emails  
**Triggered when**: Admin approves a student signup  
**Required variables in template**:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - User's name
- `{{subject}}` - Email subject
- `{{message}}` - Approval message body

### Template 2: "Contact Us" (template_amveg2r)
**Used for**: Replying to contact form messages  
**Triggered when**: Admin replies to a contact message  
**Required variables in template**:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - User's name
- `{{subject}}` - Original subject
- `{{reply_message}}` - Admin's reply
- `{{original_message}}` - Original message from user

---

## ✅ Verification Checklist

Before configuring, ensure your templates have these variables:

### "Welcome" Template (Approval):
```
Subject: {{subject}}

Bonjour {{to_name}},

{{message}}

Cordialement,
L'équipe
```

### "Contact Us" Template (Reply):
```
Subject: Re: {{subject}}

Bonjour {{to_name}},

{{reply_message}}

---
Votre message original:
{{original_message}}
```

---

## 🚀 After Configuration

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Test approval email**:
   - Login as admin
   - Go to `/admin/users`
   - Approve a pending user
   - Check console for: `✅ Email sent successfully!`
   - Check email inbox (1-2 min delay)

3. **Test reply email**:
   - Go to `/admin/messages` (if exists)
   - Reply to a message
   - Check console and email

---

## 🐛 Troubleshooting

### If emails still don't send:

1. **Check console logs**:
   ```
   📧 [Approval] EmailJS configured: true  ← Should be true
   ```

2. **Test configuration**:
   ```bash
   cd /home/user/webapp
   node test-email-config.js
   ```

3. **Check EmailJS dashboard**:
   - Go to dashboard.emailjs.com
   - Check "History" tab
   - See if requests are arriving

4. **Common issues**:
   - Public key not copied correctly
   - Server not restarted after .env change
   - Template variables don't match

---

## 📊 Expected Console Output

### Before Configuration:
```
📧 [Approval] EmailJS configured: false
⚠️ Email not configured - skipping
```

### After Configuration:
```
📧 [Approval] EmailJS configured: true
📧 [Approval] Sending email to: user@example.com
📧 [Approval] Service: service_lcskdxo
📧 [Approval] Template: template_il00l6d
✅ [Approval] Email sent successfully!
```

---

## 🎯 Next Steps

1. ⏳ Get Public Key from EmailJS dashboard
2. ⏳ Create `.env` file with all credentials
3. ⏳ Restart dev server
4. ⏳ Test by approving a user

**Once configured, emails will send automatically!**

---

**Need Help?** Reply with your Public Key and I can create the `.env` file for you.
