# Le Fil d'Or

Online tailoring platform for custom Algerian caftans.
Customers send an order (photo + 4 measurements + contact info) → it appears on the admin
dashboard and an HTML email with all the details is sent to the admin.

```
le-fil-dor/
├── BackEnd/    Django + Django REST Framework + PostgreSQL   (the API)
└── FrontEnd/   React + SCSS (Vite)                            (the website + dashboard)
```

Everything that changes between your computer and the server lives in **two `.env` files**:
`BackEnd/.env` and `FrontEnd/.env`. You should not need to edit code to deploy.

---

## 1. Run it locally

### BackEnd

```bash
cd BackEnd
python -m venv venv
venv\Scripts\activate            # Windows      (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
```

1. Create the database and its tables with your SQL file:
   ```bash
   createdb -U postgres -p 5433 le_fil_dor
   psql -U postgres -p 5433 -d le_fil_dor -f le_fil_dor_schema.sql
   ```
2. Open `BackEnd/.env` and check the `DB_*` values.
3. Then:
   ```bash
   python manage.py migrate            # Django's own tables (the 4 project tables already exist)
   python manage.py seed_geography     # fills the 58 wilayas + 1541 communes (only if empty)
   python manage.py create_admin       # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env
   python manage.py runserver          # http://localhost:8000
   ```

### FrontEnd

```bash
cd FrontEnd
npm install
npm run dev                            # http://localhost:5173
```

### Using the site

- Customer page: `http://localhost:5173/`
- Admin login: press the **top logo 3 times quickly** (the `/login` page is hidden).
- Dashboard: orders, change status, delete (with a warning popup).
- Dashboard → **الإعدادات**: change the login email and password.

---

## 2. The `.env` files

### `BackEnd/.env`

| Variable | What it does |
|---|---|
| `DEBUG` | `True` locally, **`False` in production** |
| `SECRET_KEY` | long random text, **change it in production** |
| `ALLOWED_HOSTS` | domains of the API, e.g. `api.your-domain.com` |
| `CORS_ALLOWED_ORIGINS` | domain(s) of the website, e.g. `https://your-domain.com` |
| `FRONTEND_URL` | website address, used for the button inside the email |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | used only by `python manage.py create_admin` |
| `EMAIL_HOST_USER` | your Gmail address (the sender) |
| `EMAIL_HOST_PASSWORD` | the 16 character Gmail App Password |
| `ORDER_NOTIFY_EMAIL` | who receives the "new order" email (empty = the Gmail above) |
| `MAX_UPLOAD_MB` | maximum photo size |
| `TOKEN_LIFETIME_DAYS` | how long an admin login stays valid |

### `FrontEnd/.env`

| Variable | What it does |
|---|---|
| `VITE_API_URL` | address of the BackEnd, e.g. `https://api.your-domain.com` |

Vite reads it **when building**, so run `npm run build` again after changing it.

---

## 3. Gmail App Password (for the order emails)

1. Google Account → **Security** → turn on **2-Step Verification**.
2. Google Account → search **"App passwords"** → create one (any name).
3. Google shows 16 characters like `abcd efgh ijkl mnop` → paste it in `EMAIL_HOST_PASSWORD`
   (spaces are removed automatically).
4. Put your Gmail address in `EMAIL_HOST_USER`.

If `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` are empty, emails are **printed in the terminal**
instead of being sent (handy while developing). Sending happens in the background: if Gmail is
down the order is still saved, and the error is printed in the BackEnd terminal (`[email] ...`).

---

## 4. Where things are

```
BackEnd/
├── config/                settings.py (reads .env), urls.py, test_runner.py
├── apps/
│   ├── accounts/          admin login, change email / password   (authentication.py = token logic)
│   ├── geography/         wilayas + communes
│   └── orders/            orders: models, serializers (validation), views, emails.py, templates/ (email design)
└── uploads/               customer photos (created automatically, only the file name is stored in the DB)

FrontEnd/src/
├── lib/                   api.js (ALL requests go through it), auth.js, orders.js, geography.js, utils.js
├── hooks/useOrderForm.js  the order form logic
├── pages/                 order-page, login-page, dashboard-page, settings-page
└── components/            Main/ (customer side) and Dashboard/ (admin side)
```

### Photos

Uploaded photos are resized to max 1600 px, saved as JPEG in **`BackEnd/uploads/`** with a random
name (the folder is created if missing). The database stores only that file name. Deleting an
order also deletes its file.

---

## 5. API

Admin routes need the header `Authorization: Bearer <token>` (the website does this for you).

| Method | URL | Who | What |
|---|---|---|---|
| POST | `/api/auth/login/` | public | `{email, password}` → `{token, admin}` |
| GET | `/api/auth/me/` | admin | who is logged in |
| POST | `/api/auth/change-email/` | admin | `{current_password, new_email}` |
| POST | `/api/auth/change-password/` | admin | `{current_password, new_password, confirm_password}` → new token |
| GET | `/api/geography/wilayas/` | public | the 58 wilayas |
| GET | `/api/geography/communes/?wilaya_id=16` | public | communes of one wilaya |
| POST | `/api/orders/` | public | order form (multipart: `full_name, phone, wilaya, commune, model_image, chest, hips, sleeve_length, garment_length`) |
| GET | `/api/orders/?status=pending` | admin | list orders (newest first) |
| GET | `/api/orders/<id>/` | admin | one order |
| PATCH | `/api/orders/<id>/` | admin | `{status}`: `pending`, `contacted`, `in_progress`, `completed`, `cancelled` |
| DELETE | `/api/orders/<id>/` | admin | delete the order and its photo |

Protections: login limited to 10 tries/minute, order form to 30/hour per IP; tokens stop working
as soon as the password changes.

---

## 6. Deploying

1. **BackEnd/.env**: `DEBUG=False`, new `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
   (your website domain, with `https://`), `FRONTEND_URL`, production `DB_*`, Gmail values.
2. Run Django with gunicorn behind nginx, e.g. `gunicorn config.wsgi` (add `gunicorn` to the venv).
3. **FrontEnd/.env**: `VITE_API_URL=https://api.your-domain.com`, then `npm run build` and serve
   the `dist/` folder with nginx (all routes must fall back to `index.html`).
4. Photos: Django already serves `/uploads/`; for more speed let nginx do it:
   ```nginx
   location /uploads/ { alias /path/to/le-fil-dor/BackEnd/uploads/; }
   ```
   Also set `client_max_body_size 12m;` so photo uploads are not refused.
5. Behind nginx set `NUM_PROXIES=1` in `BackEnd/.env` so the rate limits see the real visitor IP.
6. **Back up** `BackEnd/uploads/` together with the database.

---

## 7. Tests

```bash
cd BackEnd && python manage.py test     # uses a temporary database, your data is safe
```

## Troubleshooting

- **"تعذّر الاتصال بالخادم"** on the website → BackEnd not running, or `VITE_API_URL` is wrong
  (rebuild after changing it), or the website domain is missing from `CORS_ALLOWED_ORIGINS`.
- **Order saved but no email** → look at the BackEnd terminal for a line starting with `[email]`.
  Usually the App Password is wrong or 2-Step Verification is off.
- **Forgot the admin password** → `python manage.py create_admin` resets it to `ADMIN_PASSWORD`.

Powered by FeeQra
