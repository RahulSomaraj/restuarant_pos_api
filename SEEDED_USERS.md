# Seeded Users

This document contains the default users that are created when running the database seeder.

## Admin Users

| Email                     | Password      | Name        | Role  |
| ------------------------- | ------------- | ----------- | ----- |
| admin@restaurant.com      | admin123      | Admin User  | ADMIN |
| superadmin@restaurant.com | superadmin123 | Super Admin | ADMIN |

## Staff Users

| Email                  | Password   | Name          | Role  |
| ---------------------- | ---------- | ------------- | ----- |
| manager@restaurant.com | manager123 | John Manager  | STAFF |
| chef@restaurant.com    | chef123    | Maria Chef    | STAFF |
| waiter@restaurant.com  | waiter123  | Alex Waiter   | STAFF |
| cashier@restaurant.com | cashier123 | Sarah Cashier | STAFF |

## Customer Users

| Email                 | Password    | Name         | Role     |
| --------------------- | ----------- | ------------ | -------- |
| customer1@example.com | customer123 | Mike Johnson | CUSTOMER |
| customer2@example.com | customer123 | Emily Davis  | CUSTOMER |
| customer3@example.com | customer123 | David Wilson | CUSTOMER |
| customer4@example.com | customer123 | Lisa Brown   | CUSTOMER |

## How to Run the Seeder

### Local Development

```bash
npm run seed:users
```

### With Docker

```bash
# First start the services
npm run docker:up:build

# Then run the seeder
npm run seed:users:docker
```

### Manual Execution

```bash
# Make sure database is running and accessible
ts-node seed-database.ts
```

## User Roles

- **ADMIN**: Full system access, can manage users, settings, and all data
- **STAFF**: Restaurant staff access, can manage orders, menu items, and customer data
- **CUSTOMER**: Customer access, can place orders and view their own data

## Security Notes

- All passwords are hashed using bcrypt with salt rounds of 10
- These are development/test credentials - change them in production
- The seeder checks for existing users and skips duplicates
- Passwords should be changed after first login in production

## API Testing

You can use these credentials to test the authentication endpoints:

```bash
# Login example
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'
```
