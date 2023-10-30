## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
## Endpoints API

```bash
    SEED_INITIALIZATION_GET
    http://localhost:3000/api/seed
```
```bash
    AUTH_POST
    http://localhost:3000/api/user/register
    http://localhost:3000/api/user/login
    http://localhost:3000/api/user/validate-token
```
```bash
    SEARCH_BUTTON_GET
    http://localhost:3000/api/search/solar
```
```bash
    LIST_PRODUCTS_FOR_GENDER_GET
    http://localhost:3000/api/products?gender=men
    http://localhost:3000/api/products?gender=women
    http://localhost:3000/api/products?gender=kid
    LIST_PRODUCTS_ALL_GET
    http://localhost:3000/api/products
    LIST_PRODUCTS_FOR_SLUG_GET
    http://localhost:3000/api/products/[slug]
```

